import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Download, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import {
  trackEventWithId,
  sendServerEvent,
  getStoredEmail,
  getStoredName,
} from "@/lib/facebookPixel";

export default function Success() {
  const name = localStorage.getItem("emcinco_name") || "Guerreiro(a)";
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    const verifyPaymentAndTrack = async () => {
      // Get payment_intent from URL 
      // Works for both direct navigation and Stripe redirect (3DS flow)
      // Stripe automatically adds payment_intent, payment_intent_client_secret, and redirect_status to return_url
      const urlParams = new URLSearchParams(window.location.search);
      let paymentIntentId = urlParams.get("payment_intent");
      
      // Also check for redirect_status to confirm Stripe redirect
      const redirectStatus = urlParams.get("redirect_status");
      if (redirectStatus && redirectStatus !== "succeeded") {
        console.error("Stripe redirect status not succeeded:", redirectStatus);
        setIsVerifying(false);
        return;
      }

      if (!paymentIntentId) {
        console.error("No payment_intent in URL - Purchase event NOT sent");
        setIsVerifying(false);
        return;
      }

      // Client-side dedupe: check localStorage
      const trackedPayments = JSON.parse(localStorage.getItem("emcinco_tracked_purchases") || "[]");
      if (trackedPayments.includes(paymentIntentId)) {
        console.log("Payment already tracked (localStorage):", paymentIntentId);
        setPaymentVerified(true);
        setIsVerifying(false);
        return;
      }

      // Prevent duplicate tracking within same page lifecycle
      if (purchaseTrackedRef.current) {
        setIsVerifying(false);
        return;
      }

      try {
        const email = getStoredEmail();
        
        // Verify payment with backend (POST with email for security)
        const response = await fetch("/api/stripe/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId, email }),
        });
        const data = await response.json();

        if (data.verified) {
          setPaymentVerified(true);
          purchaseTrackedRef.current = true;

          // Save to localStorage to prevent future duplicate tracking
          trackedPayments.push(paymentIntentId);
          localStorage.setItem("emcinco_tracked_purchases", JSON.stringify(trackedPayments));

          // Now send Purchase event since payment is confirmed
          const firstName = getStoredName();
          const selectedPlan = data.planId || localStorage.getItem("emcinco_selected_plan") || "4week";
          const isFinalOffer = localStorage.getItem("emcinco_final_offer") === "true";
          const contentId = isFinalOffer
            ? `emcinco_${selectedPlan}_final`
            : `emcinco_${selectedPlan}`;

          // Use actual amount from Stripe (in cents, convert to reais)
          const value = data.amount / 100;

          const purchaseEventId = trackEventWithId("Purchase", {
            currency: "BRL",
            value,
            content_ids: [contentId],
            content_type: "product",
            num_items: 1,
          });

          sendServerEvent(
            "Purchase",
            { email, firstName },
            {
              value,
              currency: "BRL",
              contentIds: [contentId],
              contentName: `Plano EmCinco ${selectedPlan}`,
              contentType: "product",
              numItems: 1,
            },
            purchaseEventId,
          );

          console.log("Purchase event sent - payment verified:", paymentIntentId);
        } else if (data.alreadyProcessed) {
          // Server says already tracked
          setPaymentVerified(true);
          console.log("Payment already tracked (server):", paymentIntentId);
        } else {
          console.error("Payment not verified - Purchase event NOT sent:", data.status);
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPaymentAndTrack();
  }, []);

  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Confirmando seu pagamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-12 px-4 pb-12">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="mb-8"
      >
        <div className="bg-primary/10 p-4 rounded-full">
          <CheckCircle2 className="w-20 h-20 text-primary" />
        </div>
      </motion.div>

      <div className="text-center space-y-4 max-w-md mx-auto mb-12">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-mono font-bold text-foreground"
        >
          Parabéns, {name}!
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground"
        >
          Seu acesso vitalício ao EmCinco e à Comunidade Mastermind foi
          confirmado com sucesso.
        </motion.p>
      </div>

      <div className="grid gap-6 w-full max-w-xl">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Seu Plano está Pronto</h3>
                <p className="text-sm text-muted-foreground">
                  As suas primeiras 4 semanas de missões personalizadas já foram
                  geradas com base no seu perfil.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-blue-500 p-2 rounded-lg text-white">
                <Download className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Próximos Passos</h3>
                <p className="text-sm text-muted-foreground">
                  Enviamos um e-mail com o seu guia de boas-vindas e o link de
                  acesso exclusivo à nossa comunidade privada.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 w-full max-w-md space-y-4"
      >
        <Link href="https://app.emcinco.com/login">
          <Button className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl hover-elevate">
            ACESSAR MEU PLANO AGORA
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </Link>
        <p className="text-center text-sm text-muted-foreground">
          Você será redirecionado para o seu dashboard pessoal.
        </p>
      </motion.div>
    </div>
  );
}
