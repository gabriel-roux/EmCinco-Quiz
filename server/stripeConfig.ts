// Mapeamento de preços Stripe para assinaturas EmCinco
// Criados via scripts/create-stripe-prices.ts

export const STRIPE_PRICE_IDS = {
  // Preços Regulares
  '1week_regular': 'price_1SprilEtwsiGnZB1RG0vONdz',
  '4week_regular': 'price_1SprimEtwsiGnZB1iNnpon7S',
  '12week_regular': 'price_1SprimEtwsiGnZB1JOgwmxgg',
  // Preços Exit Popup (75% off)
  '1week_exit': 'price_1SprimEtwsiGnZB1frOERNST',
  '4week_exit': 'price_1SprimEtwsiGnZB1y6CCEqyK',
  '12week_exit': 'price_1SprinEtwsiGnZB1Tp5zozjb',
} as const;

// Dias de trial por plano (igual ao período do plano)
export const TRIAL_DAYS = {
  '1week': 7,
  '4week': 28,
  '12week': 84,
} as const;

// Preços para pagamento único inicial (em centavos BRL)
export const INITIAL_PAYMENT_AMOUNTS = {
  regular: {
    '1week': 1050,  // R$ 10,50
    '4week': 1999,  // R$ 19,99
    '12week': 3499, // R$ 34,99
  },
  exit: {
    '1week': 262,   // R$ 2,62
    '4week': 499,   // R$ 4,99
    '12week': 874,  // R$ 8,74
  },
} as const;

export function getStripePriceId(planId: string, isFinalOffer: boolean): string {
  const suffix = isFinalOffer ? 'exit' : 'regular';
  const key = `${planId}_${suffix}` as keyof typeof STRIPE_PRICE_IDS;
  return STRIPE_PRICE_IDS[key];
}

export function getTrialDays(planId: string): number {
  return TRIAL_DAYS[planId as keyof typeof TRIAL_DAYS] || 7;
}

export function getInitialPaymentAmount(planId: string, isFinalOffer: boolean): number {
  const priceSet = isFinalOffer ? INITIAL_PAYMENT_AMOUNTS.exit : INITIAL_PAYMENT_AMOUNTS.regular;
  return priceSet[planId as keyof typeof priceSet] || 1999;
}
