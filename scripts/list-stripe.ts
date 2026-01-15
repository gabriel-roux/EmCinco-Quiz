import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function listStripeData() {
  console.log("=== PRODUTOS ===");
  const products = await stripe.products.list({ limit: 100 });
  for (const p of products.data) {
    console.log(`${p.id} | ${p.name} | active: ${p.active}`);
  }
  
  console.log("\n=== PREÇOS ===");
  const prices = await stripe.prices.list({ limit: 100, active: true, expand: ['data.product'] });
  for (const price of prices.data) {
    const productName = typeof price.product === 'object' ? (price.product as any).name : price.product;
    const interval = price.recurring ? `${price.recurring.interval_count} ${price.recurring.interval}` : 'one-time';
    console.log(`${price.id} | ${productName} | ${price.unit_amount! / 100} ${price.currency} | ${interval} | nickname: ${price.nickname || 'N/A'}`);
  }
}

listStripeData().catch(console.error);
