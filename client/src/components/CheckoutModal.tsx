import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CreditCard, Check, Apple } from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import { cn } from "@/lib/utils";
import { trackAddPaymentInfo, trackPurchase, sendServerEvent } from "@/lib/facebookPixel";

interface Plan {
  id: string;
  name: string;
  originalPrice: string;
  discountedPrice: string;
  pricePerDay: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: "1week" | "4week" | "12week";
  onExitIntent: () => void;
  isFinalOffer?: boolean;
}

const regularPlans: Record<string, Plan> = {
  "1week": {
    id: "1week",
    name: "Plano 1 Semana",
    originalPrice: "R$49,99",
    discountedPrice: "R$10,50",
    pricePerDay: "R$1,50",
  },
  "4week": {
    id: "4week",
    name: "Plano 4 Semanas",
    originalPrice: "R$49,99",
    discountedPrice: "R$19,99",
    pricePerDay: "R$0,71",
  },
  "12week": {
    id: "12week",
    name: "Plano 12 Semanas",
    originalPrice: "R$99,99",
    discountedPrice: "R$34,99",
    pricePerDay: "R$0,41",
  },
};

const finalOfferPlans: Record<string, Plan> = {
  "1week": {
    id: "1week",
    name: "Plano 1 Semana",
    originalPrice: "R$49,99",
    discountedPrice: "R$2,62",
    pricePerDay: "R$0,37",
  },
  "4week": {
    id: "4week",
    name: "Plano 4 Semanas",
    originalPrice: "R$49,99",
    discountedPrice: "R$4,99",
    pricePerDay: "R$0,17",
  },
  "12week": {
    id: "12week",
    name: "Plano 12 Semanas",
    originalPrice: "R$99,99",
    discountedPrice: "R$8,74",
    pricePerDay: "R$0,10",
  },
};

function CheckoutForm({
  plan,
  onClose,
  onExitIntent,
  isFinalOffer,
}: {
  plan: Plan;
  onClose: () => void;
  onExitIntent: () => void;
  isFinalOffer: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<"fast" | "card">("fast");
  const [isProcessing, setIsProcessing] = useState(false);
  const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);

  const discount = isFinalOffer ? "R$45,00" : "R$30,00";
  const discountPercent = isFinalOffer ? "75%" : "60%";
  const promoCode = isFinalOffer ? "emcinco_final" : "emcinco_jan26";

  useEffect(() => {
    const priceValue = parseFloat(plan.discountedPrice.replace("R$", "").replace(",", "."));
    trackAddPaymentInfo(priceValue);
    
    const storedAnswers = localStorage.getItem("emcinco_answers");
    let email = "";
    if (storedAnswers) {
      try {
        email = JSON.parse(storedAnswers).email || "";
      } catch (e) {}
    }
    sendServerEvent("AddPaymentInfo", { email }, { value: priceValue, currency: "BRL" });
  }, [plan.id, plan.discountedPrice]);

  const handleCardPaymentSelect = () => {
    setPaymentMethod("card");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      console.error(error);
      setIsProcessing(false);
    } else {
      // Payment confirmed, trigger Purchase event
      const priceValue = parseFloat(plan.discountedPrice.replace("R$", "").replace(",", "."));
      trackPurchase(priceValue, [plan.id]);
      
      const storedAnswers = localStorage.getItem("emcinco_answers");
      let email = "";
      if (storedAnswers) {
        try {
          email = JSON.parse(storedAnswers).email || "";
        } catch (e) {}
      }
      sendServerEvent("Purchase", { email }, { value: priceValue, currency: "BRL", contentIds: [plan.id] });

      // If no error and no redirect happened, manually navigate
      window.location.href = "/success";
    }
  };

  const handleClose = () => {
    onExitIntent();
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
        <h2 className="font-bold text-lg">Complete seu checkout</h2>
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
            <span>Desconto oferta introdutória</span>
            <span>-{discount}</span>
          </div>
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-center text-sm text-muted-foreground">
            Código promocional aplicado:{" "}
            <span className="font-medium">{promoCode}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-lg">Total:</span>
            <span className="font-bold text-xl">{plan.discountedPrice}</span>
          </div>
          <div className="text-right text-sm text-green-600">
            Você economizou {discount} ({discountPercent} OFF)
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCardPaymentSelect}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all",
              paymentMethod === "card"
                ? "border-primary bg-primary/5"
                : "border-border",
            )}
            data-testid="button-card-payment"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  paymentMethod === "card"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {paymentMethod === "card" && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="font-medium">Cartão de crédito</span>
              <div className="flex items-center gap-1 ml-auto">
                <SiVisa className="w-8 h-5 text-blue-600" />
                <SiMastercard className="w-6 h-5" />
                <SiAmericanexpress className="w-6 h-5 text-blue-500" />
              </div>
            </div>
          </button>

          {paymentMethod === "card" && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 animate-in fade-in slide-in-from-top-2"
            >
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
                {isProcessing ? "PROCESSANDO..." : "CONTINUAR"}
              </button>
            </form>
          )}
        </div>
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
}: CheckoutModalProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const plans = isFinalOffer ? finalOfferPlans : regularPlans;
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

      fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan, isFinalOffer }),
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
