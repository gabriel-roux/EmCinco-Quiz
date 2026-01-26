import { useState, useEffect } from "react";
import {
  Check,
  X,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Target,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import tiredPhoto from "@assets/image_1767730709233.png";
import happyPhoto from "@assets/image_1767730696591.png";
import CheckoutModal from "@/components/CheckoutModal";
import ExitPopup from "@/components/ExitPopup";
import { trackEventWithId, sendServerEvent, getStoredEmail, getStoredName } from "@/lib/facebookPixel";

// Componente de título animado com dois highlights (vermelho e azul)
function FinalTitle() {
  const parts = [
    { text: "Esta é sua", type: "normal" as const },
    { text: "última chance", type: "red" as const },
    { text: "de transformar sua rotina por apenas", type: "normal" as const },
    { text: "R$4,99", type: "blue" as const },
  ];

  let wordIndex = 0;
  const allWords: { word: string; type: "normal" | "red" | "blue"; index: number }[] = [];
  
  parts.forEach(part => {
    const words = part.text.split(" ");
    words.forEach(word => {
      allWords.push({ word, type: part.type, index: wordIndex });
      wordIndex++;
    });
  });

  const totalWords = allWords.length;
  const lastWordDelay = 0.2 + ((totalWords - 1) * 0.08);
  const highlightDelay = lastWordDelay + 0.3;

  return (
    <h1 className="text-2xl md:text-3xl font-mono font-extrabold leading-tight overflow-hidden">
      {allWords.map((item, i) => {
        const delay = 0.2 + (item.index * 0.08);
        
        if (item.type === "normal") {
          return (
            <motion.span
              key={`word-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay, ease: "easeOut" }}
              className="inline-block mr-[0.3em]"
            >
              {item.word}
            </motion.span>
          );
        }
        
        return (
          <span key={`hl-wrap-${i}`} className="inline-block relative mr-[0.3em]">
            <span 
              className={item.type === "red" ? "highlight-block-bg-red" : "highlight-block-bg"}
              style={{ animationDelay: `${highlightDelay}s` }}
            />
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay, ease: "easeOut" }}
              className="inline-block relative z-10 text-white"
            >
              {item.word}
            </motion.span>
          </span>
        );
      })}
    </h1>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TestimonialProps {
  name: string;
  text: string;
}

function Testimonial({ name, text }: TestimonialProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
      <div className="font-bold text-foreground">{name}</div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default function ResultFinal() {
  const [selectedPlan, setSelectedPlan] = useState<
    "1week" | "4week" | "12week"
  >("4week");
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const email = getStoredEmail();
    const firstName = getStoredName();
    const contentId = `emcinco_${selectedPlan}_final`;
    
    const priceMap: Record<string, number> = {
      "1week": 2.62,
      "4week": 4.99,
      "12week": 8.74,
    };
    const value = priceMap[selectedPlan] || 4.99;

    const viewContentId = trackEventWithId("ViewContent", {
      content_name: "EmCinco Final Offer",
      currency: "BRL",
      value,
    });
    
    const initiateCheckoutId = trackEventWithId("InitiateCheckout", {
      currency: "BRL",
      value,
      content_ids: [contentId],
      content_type: "product",
      num_items: 1,
    });

    sendServerEvent(
      "ViewContent",
      { email, firstName },
      { value, currency: "BRL", contentName: "EmCinco Final Offer" },
      viewContentId,
    );
    sendServerEvent(
      "InitiateCheckout",
      { email, firstName },
      { value, currency: "BRL", contentIds: [contentId], contentType: "product", numItems: 1 },
      initiateCheckoutId,
    );
  }, [selectedPlan]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      mins: mins.toString().padStart(2, "0"),
      secs: secs.toString().padStart(2, "0"),
    };
  };

  const time = formatTime(timeLeft);

  const faqs = [
    {
      question: "Por que a abordagem EmCinco funciona?",
      answer:
        "Nosso plano ajuda voce a construir habitos de forma mais profunda, com mais energia e foco. Combinamos tecnicas comprovadas de mudanca comportamental com orientacao personalizada.",
    },
    {
      question: "Como este plano pode me ajudar?",
      answer:
        "O EmCinco foi desenvolvido para eliminar a fadiga de decisao e criar momentum consistente.",
    },
  ];

  const testimonials = [
    {
      name: "Ricardo M.",
      text: "Aprendi a falar em publico em 30 dias. Hoje recebo elogios em todas as reuniões.",
    },
    {
      name: "Mariana L.",
      text: "O EmCinco me ajudou a dominar análise de dados em tempo recorde.",
    },
  ];

  const handleExitIntent = () => {
    setShowCheckout(false);
    setShowExitPopup(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-green-500 text-white py-3 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-bold">
            <span className="line-through text-white/60">60%</span>
          </div>
          <div className="bg-white text-green-600 rounded-lg px-3 py-1 text-sm font-bold">
            75% OFF
          </div>
          <span className="font-medium">
            Desconto adicional de 75% aplicado!
          </span>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8 pt-8 space-y-8">
        <div className="rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 border-b border-border/30">
            <div className="text-center py-3 text-muted-foreground font-medium text-sm">
              Agora
            </div>
            <div className="text-center py-3 text-primary font-medium text-sm">
              Sua Meta
            </div>
          </div>

          <div className="flex items-center justify-center p-6 gap-2">
            <div className="flex-1 max-w-[140px] rounded-xl overflow-hidden">
              <img
                src={tiredPhoto}
                alt="Antes"
                className="w-full h-full object-cover grayscale opacity-80"
              />
            </div>
            <div className="flex text-primary/40 flex-shrink-0">
              <ChevronRight className="w-5 h-5" />
              <ChevronRight className="w-5 h-5 -ml-3" />
              <ChevronRight className="w-5 h-5 -ml-3" />
            </div>
            <div className="flex-1 max-w-[140px] rounded-xl overflow-hidden">
              <img
                src={happyPhoto}
                alt="Depois"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-row gap-4 px-6 pb-6 items-start">
            <div className="flex-1 space-y-4 min-w-0">
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Estresse Físico
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  Sobrecarregado
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Bateria do Corpo
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  Baixa
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-1/4 bg-red-500 rounded-full" />
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Nível de Energia
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  Esgotado
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 min-w-0 text-right">
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Estresse Físico
                </div>
                <div className="font-bold text-[11px] text-primary">
                  Equilibrado
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Bateria do Corpo
                </div>
                <div className="font-bold text-[11px] text-primary">
                  Totalmente recarregada
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" />
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Nível de Energia
                </div>
                <div className="font-bold text-[11px] text-primary">Pico</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3 overflow-hidden">
          <FinalTitle />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.4 }}
            className="text-muted-foreground text-sm"
          >
            75% OFF aplicado automaticamente. Oferta válida apenas agora.
          </motion.p>
        </div>

        <div className="space-y-4">
          {testimonials.map((t, idx) => (
            <Testimonial key={idx} name={t.name} text={t.text} />
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          +3.812 pessoas usando o método EmCinco™ para destravar foco e consistência.
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-lg text-center">O que você recebe HOJE:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>Seu plano personalizado de 4 semanas</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>1 desafio novo todos os dias (apenas 5 min)</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>Acompanhamento de progresso automático</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>Relatórios semanais de evolução</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
          <span className="text-amber-700 dark:text-amber-400 font-medium">
            Vagas limitadas para o plano de 4 semanas. Restam <span className="font-bold">3</span> acessos.
          </span>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 flex-col gap-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-green-700 dark:text-green-400">
              Desconto FINAL de 75% aplicado!
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground line-through">
                emcinco_jan26
              </span>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">emcinco_final</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">
                {time.mins}:{time.secs}
              </span>
              <div className="text-xs text-muted-foreground">
                minutos segundos
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setSelectedPlan("1week")}
            className={cn(
              "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 opacity-60",
              selectedPlan === "1week"
                ? "border-primary bg-primary/5"
                : "border-border bg-card",
            )}
            data-testid="plan-1week-final"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  selectedPlan === "1week"
                    ? "border-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {selectedPlan === "1week" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold">Plano 1 Semana</div>
                <div className="text-sm text-muted-foreground">
                  R$49,99
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">R$7,14</div>
                <div className="text-xs text-muted-foreground">por dia</div>
              </div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider z-10">
              Mais Popular
            </div>
            <button
              onClick={() => setSelectedPlan("4week")}
              className={cn(
                "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
                selectedPlan === "4week"
                  ? "border-primary bg-primary/15"
                  : "border-border bg-card",
              )}
              data-testid="plan-4week-final"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    selectedPlan === "4week"
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30",
                  )}
                >
                  {selectedPlan === "4week" && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-black dark:text-foreground">
                    Plano 4 Semanas
                  </div>
                  <div className="text-sm">
                    <span className="line-through text-red-500">R$49,99</span>{" "}
                    <span className="text-green-600 font-bold">R$4,99</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-black dark:text-foreground">
                    R$0,17
                  </div>
                  <div className="text-xs text-muted-foreground">por dia</div>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => setSelectedPlan("12week")}
            className={cn(
              "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
              selectedPlan === "12week"
                ? "border-primary bg-primary/5"
                : "border-border bg-card",
            )}
            data-testid="plan-12week-final"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  selectedPlan === "12week"
                    ? "border-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {selectedPlan === "12week" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold">Plano 12 Semanas</div>
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">R$99,99</span>{" "}
                  <span className="text-green-600 font-bold">R$8,74</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">R$0,10</div>
                <div className="text-xs text-muted-foreground">por dia</div>
              </div>
            </div>
          </button>

          <div className="space-y-4 pt-3">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
              data-testid="button-start-plan-final"
            >
              COMEÇAR AGORA — QUERO MUDAR MEU HÁBITO
            </button>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-green-700 dark:text-green-400">Garantia de 30 dias</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Se você não sentir progresso real, devolvemos 100% do seu dinheiro.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Pagamento seguro</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Sem assinatura oculta</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Cancelamento fácil</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-center font-mono mb-4">
            Perguntas Frequentes
          </h3>
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === idx}
              onToggle={() => setOpenFAQ(openFAQ === idx ? null : idx)}
            />
          ))}
        </div>
      </main>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        selectedPlan={selectedPlan}
        onExitIntent={handleExitIntent}
        isFinalOffer={true}
      />

      <ExitPopup
        isOpen={showExitPopup}
        onClose={() => setShowExitPopup(false)}
        onContinue={() => setShowExitPopup(false)}
      />
    </div>
  );
}
