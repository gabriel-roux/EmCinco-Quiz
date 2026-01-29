import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { trackEventWithId, sendServerEvent, getStoredEmail, getStoredName } from "@/lib/facebookPixel";
import { useLocale, pricing, type Locale } from "@/lib/i18n";
import { landingContent } from "@/data/quizSteps";

interface Plan {
  id: string;
  name: string;
  originalPrice: string;
  discountedPrice: string;
  pricePerDay: string;
  priceValue: number;
  currency: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: "1week" | "4week" | "12week";
  onExitIntent?: () => void;
  isFinalOffer?: boolean;
  isBackOffer?: boolean;
}

function getPlans(locale: Locale, isFinalOffer: boolean, isBackOffer: boolean = false): Record<string, Plan> {
  const p = pricing[locale];
  const prices = isBackOffer ? p.backOffer : (isFinalOffer ? p.final : p.regular);
  const sym = p.currencySymbol;
  const content = landingContent[locale];
  
  const formatPrice = (val: number) => {
    if (locale === "es") {
      return `${sym}${val.toFixed(2)}`;
    }
    return `${sym}${val.toFixed(2).replace(".", ",")}`;
  };

  return {
    "1week": {
      id: "1week",
      name: content.plan1week,
      originalPrice: formatPrice(prices["1week"].original),
      discountedPrice: formatPrice(prices["1week"].price),
      pricePerDay: formatPrice(prices["1week"].daily),
      priceValue: prices["1week"].price,
      currency: p.currency,
    },
    "4week": {
      id: "4week",
      name: content.plan4week,
      originalPrice: formatPrice(prices["4week"].original),
      discountedPrice: formatPrice(prices["4week"].price),
      pricePerDay: formatPrice(prices["4week"].daily),
      priceValue: prices["4week"].price,
      currency: p.currency,
    },
    "12week": {
      id: "12week",
      name: content.plan12week,
      originalPrice: formatPrice(prices["12week"].original),
      discountedPrice: formatPrice(prices["12week"].price),
      pricePerDay: formatPrice(prices["12week"].daily),
      priceValue: prices["12week"].price,
      currency: p.currency,
    },
  };
}

function CheckoutForm({
  plan,
  onClose,
  onExitIntent,
  isFinalOffer,
}: {
  plan: Plan;
  onClose: () => void;
  onExitIntent?: () => void;
  isFinalOffer: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { locale, t } = useLocale();

  const discountPercent = isFinalOffer ? "75%" : "60%";
  const promoCode = isFinalOffer ? "emcinco_final" : "emcinco_jan26";
  const content = landingContent[locale];
  
  const discountText = isFinalOffer ? content.discountFinal : content.discountRegular;

  useEffect(() => {
    const email = getStoredEmail();
    const firstName = getStoredName();
    const contentId = isFinalOffer ? `emcinco_${plan.id}_final` : `emcinco_${plan.id}`;
    
    const addPaymentEventId = trackEventWithId("AddPaymentInfo", {
      currency: plan.currency,
      value: plan.priceValue,
      content_ids: [contentId],
      content_type: "product",
      num_items: 1,
    });
    
    sendServerEvent(
      "AddPaymentInfo", 
      { email, firstName }, 
      { 
        value: plan.priceValue, 
        currency: plan.currency,
        contentIds: [contentId],
        contentName: plan.name,
        contentType: "product",
        numItems: 1
      },
      addPaymentEventId
    );
  }, [plan.id, plan.priceValue, plan.name, plan.currency, isFinalOffer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    // Save plan info before confirmation (in case of redirect)
    localStorage.setItem("emcinco_selected_plan", plan.id);
    localStorage.setItem("emcinco_final_offer", isFinalOffer ? "true" : "false");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        // Include payment_intent in return URL for redirect flows (3DS, etc)
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      console.error(error);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Navigate to success page with payment intent ID for verification
      window.location.href = `/success?payment_intent=${paymentIntent.id}`;
    } else if (paymentIntent && paymentIntent.status === "requires_action") {
      // Payment requires additional action (3DS, etc) - Stripe will redirect
      // The return_url will be used and we'll handle verification on Success page
      console.log("Payment requires action, Stripe will handle redirect");
    } else {
      // Payment failed or other status
      console.error("Payment not successful:", paymentIntent?.status);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (onExitIntent) {
      onExitIntent();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={handleClose}
          className="p-2 -m-2"
          data-testid="button-close-checkout"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="font-bold text-lg">{landingContent[locale].completeCheckout}</h2>
        <div className="w-5" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{plan.name}</span>
            <span className="text-muted-foreground line-through">
              {plan.originalPrice}
            </span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>{landingContent[locale].introDiscount}</span>
            <span>-{discountText}</span>
          </div>
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center text-sm text-muted-foreground">
            {landingContent[locale].promoApplied}{" "}
            <span className="font-medium">{promoCode}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-lg">{landingContent[locale].total}</span>
            <span className="font-bold text-xl">{plan.discountedPrice}</span>
          </div>
          <div className="text-right text-sm text-green-600">
            {landingContent[locale].youSaved} {discountText} ({discountPercent} OFF)
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-2 py-2">
            <SiVisa className="w-10 h-6 text-blue-600" />
            <SiMastercard className="w-8 h-6" />
            <SiAmericanexpress className="w-8 h-6 text-blue-500" />
          </div>

          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            data-testid="button-continue-payment"
          >
            <Lock className="w-4 h-4" />
            {isProcessing ? landingContent[locale].processing.toUpperCase() : landingContent[locale].pay.toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  onExitIntent,
  isFinalOffer = false,
  isBackOffer = false,
}: CheckoutModalProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { locale } = useLocale();
  const plans = getPlans(locale, isFinalOffer, isBackOffer);
  const plan = plans[selectedPlan];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      const storedAnswers = localStorage.getItem("emcinco_answers");
      const storedName = localStorage.getItem("emcinco_name");
      let email = "";
      if (storedAnswers) {
        try {
          const answers = JSON.parse(storedAnswers);
          email = answers.email || "";
        } catch (e) {
          console.error("Error parsing stored answers", e);
        }
      }

      fetch("/api/stripe/config")
        .then((res) => res.json())
        .then((data) => {
          setStripePromise(loadStripe(data.publishableKey));
        });

      // Get email and name for metadata
      let userEmail = "";
      let userName = localStorage.getItem("emcinco_name") || "";
      const answers = localStorage.getItem("emcinco_answers");
      if (answers) {
        try {
          const parsed = JSON.parse(answers);
          userEmail = parsed.email_capture || parsed.email || "";
        } catch (e) {}
      }

      fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId: selectedPlan, 
          isFinalOffer,
          email: userEmail,
          name: userName,
          locale,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, selectedPlan, isFinalOffer]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onExitIntent}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {stripePromise && clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  locale: locale === "es" ? "es" : "pt-BR",
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#10b981",
                      borderRadius: "8px",
                    },
                  },
                  loader: "auto",
                }}
                {...({
                  defaultValues: {
                    billingDetails: {
                      email: (() => {
                        const storedAnswers = localStorage.getItem("emcinco_answers");
                        if (storedAnswers) {
                          try {
                            const answers = JSON.parse(storedAnswers);
                            return answers.email || "";
                          } catch (e) {}
                        }
                        return "";
                      })(),
                      name: localStorage.getItem("emcinco_name") || "",
                    }
                  }
                } as any)}
              >
                <CheckoutForm
                  plan={plan}
                  onClose={onClose}
                  onExitIntent={onExitIntent}
                  isFinalOffer={isFinalOffer}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
