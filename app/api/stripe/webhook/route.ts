import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as SibApiV3Sdk from '@getbrevo/brevo';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover',
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialize Brevo
const brevoApiKey = process.env.BREVO_API_KEY;

function getBrevoClient() {
  const client = new SibApiV3Sdk.TransactionalEmailsApi();
  client.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    brevoApiKey || ''
  );
  return client;
}

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const supabase = getSupabase();
      const brevoClient = getBrevoClient();
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract metadata
      const productName = session.metadata?.product_name || 'Custom Poster';
      const customizationData = JSON.parse(session.metadata?.customization || '{}');
      const customerEmail = session.customer_email || customizationData.email;

      // 1. Save order to Supabase
      const { error: orderError } = await supabase.from('orders').insert({
        email: customerEmail,
        stripe_payment_id: session.payment_intent as string,
        product_name: productName,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'EUR',
        status: 'completed',
        customization_data: customizationData,
        delivered_at: new Date().toISOString(),
      });

      if (orderError) {
        console.error('Supabase order save error:', orderError);
      }

      // 2. Generate poster download URL
      const posterType = productName.toLowerCase().includes('star')
        ? 'star_map'
        : productName.toLowerCase().includes('spotify')
        ? 'spotify'
        : 'coordinates';

      const posterUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/generate-pdf?type=${posterType}&${new URLSearchParams(customizationData as any)}`;

      // 3. Send delivery email via Brevo
      const firstName = customizationData.firstName || customerEmail.split('@')[0];

      const sendSmtpEmail = {
        sender: {
          email: 'hello@lumeries.com',
          name: 'Lumeries',
        },
        to: [
          {
            email: customerEmail,
            name: firstName,
          },
        ],
        subject: '🎉 Your Custom Poster is Ready!',
        htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #7C3AED; font-size: 28px; margin-bottom: 10px; }
    .button { display: inline-block; background: linear-gradient(to right, #2563EB, #7C3AED); color: white; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .order-box { background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .features { background: #EEF2FF; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7C3AED; }
    .feature-item { margin: 10px 0; padding-left: 25px; position: relative; }
    .feature-item:before { content: "✓"; position: absolute; left: 0; color: #10B981; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 14px; color: #6B7280; }
  </style>
</head>
<body>
  <h1>Thank You for Your Order! 🎉</h1>

  <p>Hi ${firstName},</p>

  <p>Your payment was successful and your personalized <strong>${productName}</strong> is ready for download!</p>

  <div style="text-align: center;">
    <a href="${posterUrl}" class="button">📥 Download Your Poster Now</a>
  </div>

  <div class="order-box">
    <h3 style="margin-top: 0;">Order Summary</h3>
    <p><strong>Product:</strong> ${productName}</p>
    <p><strong>Amount Paid:</strong> €${((session.amount_total || 0) / 100).toFixed(2)}</p>
    <p><strong>Order ID:</strong> ${session.payment_intent}</p>
  </div>

  <div class="features">
    <h3 style="margin-top: 0;">What's Included:</h3>
    <div class="feature-item">High-resolution PDF (300 DPI, professional print quality)</div>
    <div class="feature-item">PNG file for digital use and social media</div>
    <div class="feature-item">Multiple sizes: 8x10, 11x14, 16x20 inches</div>
    <div class="feature-item">Unlimited prints - use it forever!</div>
  </div>

  <h3>How to Print:</h3>
  <ol>
    <li>Download the PDF file from the link above</li>
    <li>Take it to any print shop (Costco, Staples, FedEx, or local printer)</li>
    <li>Or print at home on high-quality paper</li>
    <li>Frame it and enjoy your personalized art!</li>
  </ol>

  <p><strong>💡 Pro Tip:</strong> For best results, use matte or semi-gloss photo paper and print at a professional lab.</p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">

  <h3>Need Help?</h3>
  <p>If you have any questions or need changes to your design, just reply to this email within 7 days and we will help you out!</p>

  <div class="footer">
    <p><strong>Lumeries</strong><br>
    Creating personalized memories, one poster at a time.</p>
    <p style="font-size: 12px; color: #9CA3AF;">This is an order confirmation email. You're receiving this because you purchased from Lumeries.</p>
  </div>
</body>
</html>
        `,
      };

      await brevoClient.sendTransacEmail(sendSmtpEmail);

      // 4. Track analytics
      await supabase.from('analytics_events').insert({
        event_type: 'purchase',
        user_identifier: customerEmail,
        metadata: {
          product_name: productName,
          amount: (session.amount_total || 0) / 100,
          stripe_payment_id: session.payment_intent,
        },
      });

      console.log('Order processed successfully:', session.payment_intent);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
