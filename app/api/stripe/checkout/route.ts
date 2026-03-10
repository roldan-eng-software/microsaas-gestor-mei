import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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
  const session = await getServerSession(authOptions)
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

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/?checkout=success`,
    cancel_url: `${baseUrl}/?checkout=cancel`,
    allow_promotion_codes: true,
    customer_email: session?.user?.email || body.email || undefined,
    client_reference_id: session?.user?.id || undefined,
    metadata: {
      name: body.name || session?.user?.name || '',
      plan,
      email: session?.user?.email || body.email || '',
      userId: session?.user?.id || '',
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
