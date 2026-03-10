import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripeSecret = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: '2024-06-20',
    })
  : null

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe nao configurado' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 })
  }

  const payload = await request.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Assinatura invalida'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const email =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.email ||
      null

    const userId = session.client_reference_id || session.metadata?.userId || null
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null

    let paidUntil: Date | null = null

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      if (subscription.current_period_end) {
        paidUntil = new Date(subscription.current_period_end * 1000)
      }
    }

    const where = userId ? { id: userId } : email ? { email } : null

    if (where) {
      await prisma.user.update({
        where,
        data: {
          hasPaid: true,
          paidUntil,
          stripeCustomerId: stripeCustomerId || undefined,
        },
      })
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : null

    if (customerId) {
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { hasPaid: false },
      })
    }
  }

  return NextResponse.json({ received: true })
}
