import Stripe from 'stripe';
import { getUncachableStripeClient } from './stripeClient';
import { getStripePriceId, getTrialDays } from './stripeConfig';
import { sendFacebookEvent } from './facebookCapi';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Track processed PaymentIntent IDs to prevent duplicate subscription creation
const processedPaymentIntents = new Set<string>();

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    // Security: Require webhook secret in production
    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured - rejecting webhook');
      throw new Error('Webhook secret not configured');
    }

    const stripe = await getUncachableStripeClient();
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error('Webhook signature verification failed');
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Idempotency check: prevent duplicate subscription creation
    if (processedPaymentIntents.has(paymentIntent.id)) {
      console.log('PaymentIntent already processed, skipping:', paymentIntent.id);
      return;
    }
    
    const { planId, isFinalOffer, email, name } = paymentIntent.metadata;
    
    if (!planId) {
      console.error('Missing planId in payment intent metadata');
      return;
    }

    const stripe = await getUncachableStripeClient();
    
    // Check if subscription already exists for this PaymentIntent
    const existingSubscriptions = await stripe.subscriptions.list({
      limit: 1,
    });
    
    for (const sub of existingSubscriptions.data) {
      if (sub.metadata.initialPaymentIntentId === paymentIntent.id) {
        console.log('Subscription already exists for this payment, skipping:', sub.id);
        processedPaymentIntents.add(paymentIntent.id);
        return;
      }
    }
    
    try {
      // 1. Create or retrieve customer
      let customer: Stripe.Customer;
      const existingCustomers = await stripe.customers.list({
        email: email || undefined,
        limit: 1,
      });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('Found existing customer:', customer.id);
      } else {
        customer = await stripe.customers.create({
          email: email || undefined,
          name: name || undefined,
          metadata: {
            source: 'emcinco_quiz',
          },
        });
        console.log('Created new customer:', customer.id);
      }

      // 2. Attach payment method to customer
      const paymentMethodId = paymentIntent.payment_method;
      if (paymentMethodId && typeof paymentMethodId === 'string') {
        try {
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
          });
          console.log('Attached payment method to customer');
        } catch (attachError: any) {
          if (attachError.code !== 'resource_already_exists') {
            console.error('Error attaching payment method:', attachError.message);
          }
        }

        // Set as default payment method for invoices
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
        console.log('Set default payment method for customer');
      }

      // 3. Create subscription with trial
      const isFinalOfferBool = isFinalOffer === 'true';
      const priceId = getStripePriceId(planId, isFinalOfferBool);
      const trialDays = getTrialDays(planId);

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        metadata: {
          planId,
          isFinalOffer: isFinalOffer || 'false',
          initialPaymentIntentId: paymentIntent.id,
        },
      });

      console.log(`Created subscription ${subscription.id} with ${trialDays} days trial`);
      
      // Mark PaymentIntent as processed
      processedPaymentIntents.add(paymentIntent.id);

      // 4. Send Facebook Purchase event (server-side only - client event removed)
      const amount = paymentIntent.amount / 100; // Convert from cents
      await sendFacebookEvent(
        'Purchase',
        'https://emcinco.replit.app/result',
        {
          email: email || undefined,
          firstName: name || undefined,
        },
        {
          value: amount,
          currency: 'BRL',
          contentIds: [planId],
          contentType: 'product',
          numItems: 1,
        }
      );
      console.log('Sent Facebook Purchase event');

    } catch (error: any) {
      console.error('Error processing payment success:', error.message);
      throw error;
    }
  }

  static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment failed:', paymentIntent.id);
    const { email, planId } = paymentIntent.metadata;
    console.log(`Payment failed for ${email || 'unknown'} - Plan: ${planId || 'unknown'}`);
  }

  static async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice paid:', invoice.id);
    
    // This is for recurring payments (after trial ends)
    if (invoice.billing_reason === 'subscription_cycle') {
      const amount = (invoice.amount_paid || 0) / 100;
      const customerEmail = invoice.customer_email || '';
      
      console.log(`Recurring payment of R$${amount} from ${customerEmail}`);
      
      // Send Facebook Purchase event for recurring payment
      await sendFacebookEvent(
        'Purchase',
        'https://emcinco.replit.app',
        {
          email: customerEmail,
        },
        {
          value: amount,
          currency: 'BRL',
          contentName: 'EmCinco Subscription Renewal',
        }
      );
    }
  }

  static async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice payment failed:', invoice.id);
    const customerEmail = invoice.customer_email || 'unknown';
    console.log(`Payment failed for ${customerEmail}`);
  }

  static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log('Subscription cancelled:', subscription.id);
    const { planId } = subscription.metadata;
    console.log(`Subscription for plan ${planId || 'unknown'} was cancelled`);
  }
}
