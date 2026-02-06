import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const { productName, price, customizationData } = body;

    // Validate required fields
    if (!productName || !price || !customizationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productName,
              description: 'Personalized custom poster - High-resolution digital files',
              images: [`${process.env.NEXT_PUBLIC_SITE_URL}/poster-preview.jpg`],
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/custom-posters`,
      customer_email: customizationData.email,
      metadata: {
        product_name: productName,
        customization: JSON.stringify(customizationData),
      },
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to create checkout session',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
