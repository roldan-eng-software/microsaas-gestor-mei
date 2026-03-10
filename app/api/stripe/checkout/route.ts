import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY

const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: '2024-06-20',
    })
  : null

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe nao configurado' },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const plan = body.plan === 'yearly' ? 'yearly' : 'monthly'
  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_PRICE_ID_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY

  if (!priceId) {
    return NextResponse.json(
      { error: 'Price ID nao configurado' },
      { status: 500 }
    )
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get('origin') ||
    'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/?checkout=success`,
    cancel_url: `${baseUrl}/?checkout=cancel`,
    allow_promotion_codes: true,
    customer_email: body.email || undefined,
    metadata: {
      name: body.name || '',
      plan,
    },
  })

  return NextResponse.json({ url: session.url })
}
