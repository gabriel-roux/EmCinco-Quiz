import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRODUCT_ID = 'prod_TnRmdlEDW6RE8k'; // EmCinco product

interface PriceConfig {
  nickname: string;
  unit_amount: number; // em centavos
  interval: 'week' | 'month' | 'year';
  interval_count: number;
}

const pricesToCreate: PriceConfig[] = [
  // Preços Regulares
  {
    nickname: 'emcinco_1week_regular',
    unit_amount: 1050, // R$10,50
    interval: 'week',
    interval_count: 1,
  },
  {
    nickname: 'emcinco_4week_regular',
    unit_amount: 1999, // R$19,99
    interval: 'week',
    interval_count: 4,
  },
  {
    nickname: 'emcinco_12week_regular',
    unit_amount: 3499, // R$34,99
    interval: 'week',
    interval_count: 12,
  },
  // Preços Exit Popup (75% off)
  {
    nickname: 'emcinco_1week_exit',
    unit_amount: 262, // R$2,62
    interval: 'week',
    interval_count: 1,
  },
  {
    nickname: 'emcinco_4week_exit',
    unit_amount: 499, // R$4,99
    interval: 'week',
    interval_count: 4,
  },
  {
    nickname: 'emcinco_12week_exit',
    unit_amount: 874, // R$8,74
    interval: 'week',
    interval_count: 12,
  },
];

async function createPrices() {
  console.log("Criando preços de assinatura para EmCinco...\n");

  const createdPrices: { nickname: string; id: string }[] = [];

  for (const config of pricesToCreate) {
    try {
      const price = await stripe.prices.create({
        product: PRODUCT_ID,
        unit_amount: config.unit_amount,
        currency: 'brl',
        recurring: {
          interval: config.interval,
          interval_count: config.interval_count,
        },
        nickname: config.nickname,
      });

      console.log(`✓ Criado: ${config.nickname} -> ${price.id}`);
      createdPrices.push({ nickname: config.nickname, id: price.id });
    } catch (error: any) {
      console.error(`✗ Erro ao criar ${config.nickname}:`, error.message);
    }
  }

  console.log("\n=== MAPEAMENTO PARA O CÓDIGO ===\n");
  console.log("export const STRIPE_PRICE_IDS = {");
  for (const p of createdPrices) {
    console.log(`  '${p.nickname}': '${p.id}',`);
  }
  console.log("};");
}

createPrices().catch(console.error);
