import { useState, useEffect } from "react";
import {
  Check,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
const tiredPhoto = "/images/tired-photo.webp";
const happyPhoto = "/images/happy-photo.webp";
import CheckoutModal from "@/components/CheckoutModal";
import { trackEventWithId, sendServerEvent, getStoredEmail, getStoredName } from "@/lib/facebookPixel";
import { useLocale } from "@/lib/i18n";

function BackOfferTitle({ locale }: { locale: string }) {
  const isSpanish = locale === "es";
  
  const parts = isSpanish ? [
    { text: "¡Espera!", type: "red" as const },
    { text: "Tenemos una oferta especial de", type: "normal" as const },
    { text: "50% OFF", type: "blue" as const },
    { text: "solo para ti", type: "normal" as const },
  ] : [
    { text: "Espere!", type: "red" as const },
    { text: "Temos uma oferta especial de", type: "normal" as const },
    { text: "50% OFF", type: "blue" as const },
    { text: "só para você", type: "normal" as const },
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

export default function ResultBackOffer() {
  const { locale, t } = useLocale();
  const isSpanish = locale === "es";
  
  const [selectedPlan, setSelectedPlan] = useState<"1week" | "4week" | "12week">("4week");
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const email = getStoredEmail();
    const firstName = getStoredName();
    const contentId = `emcinco_${selectedPlan}_backoffer`;
    
    const priceMap: Record<string, number> = isSpanish ? {
      "1week": 1.19,
      "4week": 2.99,
      "12week": 6.99,
    } : {
      "1week": 5.90,
      "4week": 14.90,
      "12week": 34.90,
    };
    const value = priceMap[selectedPlan] || (isSpanish ? 2.99 : 14.90);
    const currency = isSpanish ? "USD" : "BRL";

    const viewContentId = trackEventWithId("ViewContent", {
      content_name: "EmCinco Back Offer 50% OFF",
      currency,
      value,
    });

    sendServerEvent(
      "ViewContent",
      { email, firstName },
      { value, currency, contentName: "EmCinco Back Offer 50% OFF" },
      viewContentId,
    );
  }, [selectedPlan, isSpanish]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      mins: mins.toString().padStart(2, "0"),
      secs: secs.toString().padStart(2, "0"),
    };
  };

  const time = formatTime(timeLeft);

  const content = isSpanish ? {
    bannerOld: "30%",
    bannerNew: "50% OFF",
    bannerText: "¡Descuento especial de salida aplicado!",
    now: "Ahora",
    goal: "Tu Meta",
    stress: "Estrés Físico",
    stressNow: "Sobrecargado",
    stressGoal: "Equilibrado",
    battery: "Batería del Cuerpo",
    batteryNow: "Baja",
    batteryGoal: "Totalmente recargada",
    energy: "Nivel de Energía",
    energyNow: "Agotado",
    energyGoal: "Máximo",
    subtitle: "50% OFF aplicado automáticamente. Oferta válida solo ahora.",
    testimonials: [
      { name: "Carlos M.", text: "Aprendí a hablar en público en 30 días. Hoy recibo elogios en todas las reuniones." },
      { name: "Ana L.", text: "EmCinco me ayudó a dominar análisis de datos en tiempo récord." },
    ],
    socialProof: "+3.812 personas usando el método EmCinco™ para desbloquear foco y consistencia.",
    urgency: "Plazas limitadas para el plan de 4 semanas. Quedan",
    urgencySlots: "3",
    urgencyEnd: "accesos.",
    discountApplied: "¡Descuento de 50% aplicado!",
    codeBefore: "emcinco_jan26",
    codeAfter: "emcinco_exit50",
    minutes: "minutos",
    seconds: "segundos",
    plan1w: "Plan 1 Semana",
    plan4w: "Plan 4 Semanas",
    plan12w: "Plan 12 Semanas",
    perDay: "por día",
    mostPopular: "Más Popular",
    cta: "COMENZAR AHORA — QUIERO CAMBIAR MI HÁBITO",
    guarantee: "Garantía de 30 días",
    guaranteeText: "Si no sientes progreso real, te devolvemos el 100% de tu dinero.",
    secure: "Pago seguro",
    noHidden: "Sin suscripción oculta",
    easyCancel: "Cancelación fácil",
    faqTitle: "Preguntas Frecuentes",
    faqs: [
      { question: "¿Por qué funciona el enfoque EmCinco?", answer: "Nuestro plan te ayuda a construir hábitos de forma más profunda, con más energía y enfoque. Combinamos técnicas comprobadas de cambio conductual con orientación personalizada." },
      { question: "¿Cómo puede ayudarme este plan?", answer: "EmCinco fue desarrollado para eliminar la fatiga de decisión y crear momentum consistente." },
    ],
    prices: {
      "1week": { original: "US$1,49", final: "US$1,19", daily: "US$0,17" },
      "4week": { original: "US$5,99", final: "US$2,99", daily: "US$0,11" },
      "12week": { original: "US$13,99", final: "US$6,99", daily: "US$0,08" },
    },
  } : {
    bannerOld: "30%",
    bannerNew: "50% OFF",
    bannerText: "Desconto especial de saída aplicado!",
    now: "Agora",
    goal: "Sua Meta",
    stress: "Estresse Físico",
    stressNow: "Sobrecarregado",
    stressGoal: "Equilibrado",
    battery: "Bateria do Corpo",
    batteryNow: "Baixa",
    batteryGoal: "Totalmente recarregada",
    energy: "Nível de Energia",
    energyNow: "Esgotado",
    energyGoal: "Pico",
    subtitle: "50% OFF aplicado automaticamente. Oferta válida apenas agora.",
    testimonials: [
      { name: "Ricardo M.", text: "Aprendi a falar em público em 30 dias. Hoje recebo elogios em todas as reuniões." },
      { name: "Mariana L.", text: "O EmCinco me ajudou a dominar análise de dados em tempo recorde." },
    ],
    socialProof: "+3.812 pessoas usando o método EmCinco™ para destravar foco e consistência.",
    urgency: "Vagas limitadas para o plano de 4 semanas. Restam",
    urgencySlots: "3",
    urgencyEnd: "acessos.",
    discountApplied: "Desconto de 50% aplicado!",
    codeBefore: "emcinco_jan26",
    codeAfter: "emcinco_exit50",
    minutes: "minutos",
    seconds: "segundos",
    plan1w: "Plano 1 Semana",
    plan4w: "Plano 4 Semanas",
    plan12w: "Plano 12 Semanas",
    perDay: "por dia",
    mostPopular: "Mais Popular",
    cta: "COMEÇAR AGORA — QUERO MUDAR MEU HÁBITO",
    guarantee: "Garantia de 30 dias",
    guaranteeText: "Se você não sentir progresso real, devolvemos 100% do seu dinheiro.",
    secure: "Pagamento seguro",
    noHidden: "Sem assinatura oculta",
    easyCancel: "Cancelamento fácil",
    faqTitle: "Perguntas Frequentes",
    faqs: [
      { question: "Por que a abordagem EmCinco funciona?", answer: "Nosso plano ajuda você a construir hábitos de forma mais profunda, com mais energia e foco. Combinamos técnicas comprovadas de mudança comportamental com orientação personalizada." },
      { question: "Como este plano pode me ajudar?", answer: "O EmCinco foi desenvolvido para eliminar a fadiga de decisão e criar momentum consistente." },
    ],
    prices: {
      "1week": { original: "R$7,48", final: "R$5,90", daily: "R$0,84" },
      "4week": { original: "R$29,90", final: "R$14,90", daily: "R$0,53" },
      "12week": { original: "R$69,90", final: "R$34,90", daily: "R$0,42" },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-orange-500 text-white py-3 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
          <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-bold">
            <span className="line-through text-white/60">{content.bannerOld}</span>
          </div>
          <div className="bg-white text-orange-600 rounded-lg px-3 py-1 text-sm font-bold">
            {content.bannerNew}
          </div>
          <span className="font-medium">
            {content.bannerText}
          </span>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8 pt-8 space-y-8">
        <div className="rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 border-b border-border/30">
            <div className="text-center py-3 text-muted-foreground font-medium text-sm">
              {content.now}
            </div>
            <div className="text-center py-3 text-primary font-medium text-sm">
              {content.goal}
            </div>
          </div>

          <div className="flex items-center justify-center p-6 gap-2">
            <div className="flex-1 max-w-[140px] rounded-xl overflow-hidden">
              <img
                src={tiredPhoto}
                alt="Antes"
                width={140}
                height={180}
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
                width={140}
                height={180}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-row gap-4 px-6 pb-6 items-start">
            <div className="flex-1 space-y-4 min-w-0">
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  {content.stress}
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  {content.stressNow}
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  {content.battery}
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  {content.batteryNow}
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-1/4 bg-red-500 rounded-full" />
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  {content.energy}
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  {content.energyNow}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 min-w-0 text-right">
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  {content.stress}
                </div>
                <div className="font-bold text-[11px] text-primary">
                  {content.stressGoal}
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  {content.battery}
                </div>
                <div className="font-bold text-[11px] text-primary">
                  {content.batteryGoal}
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" />
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  {content.energy}
                </div>
                <div className="font-bold text-[11px] text-primary">{content.energyGoal}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3 overflow-hidden">
          <BackOfferTitle locale={locale} />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.4 }}
            className="text-muted-foreground text-sm"
          >
            {content.subtitle}
          </motion.p>
        </div>

        <div className="space-y-4">
          {content.testimonials.map((testimonial, idx) => (
            <Testimonial key={idx} name={testimonial.name} text={testimonial.text} />
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {content.socialProof}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-lg text-center">{t("result.whatYouGet")}</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>{t("result.plan4weeks")}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>{t("result.dailyChallenge")}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>{t("result.progressTracking")}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>{t("result.weeklyReports")}</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
          <span className="text-amber-700 dark:text-amber-400 font-medium">
            {content.urgency} <span className="font-bold">{content.urgencySlots}</span> {content.urgencyEnd}
          </span>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4 flex-col gap-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-orange-700 dark:text-orange-400">
              {content.discountApplied}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground line-through">
                {content.codeBefore}
              </span>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium">{content.codeAfter}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-orange-600">
                {time.mins}:{time.secs}
              </span>
              <div className="text-xs text-muted-foreground">
                {content.minutes} {content.seconds}
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
            data-testid="plan-1week-back"
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
                <div className="font-bold">{content.plan1w}</div>
                <div className="text-sm text-muted-foreground">
                  {content.prices["1week"].original}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{content.prices["1week"].daily}</div>
                <div className="text-xs text-muted-foreground">{content.perDay}</div>
              </div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider z-10">
              {content.mostPopular}
            </div>
            <button
              onClick={() => setSelectedPlan("4week")}
              className={cn(
                "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
                selectedPlan === "4week"
                  ? "border-primary bg-primary/15"
                  : "border-border bg-card",
              )}
              data-testid="plan-4week-back"
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
                    {content.plan4w}
                  </div>
                  <div className="text-sm">
                    <span className="line-through text-red-500">{content.prices["4week"].original}</span>{" "}
                    <span className="text-orange-600 font-bold">{content.prices["4week"].final}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-black dark:text-foreground">
                    {content.prices["4week"].daily}
                  </div>
                  <div className="text-xs text-muted-foreground">{content.perDay}</div>
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
            data-testid="plan-12week-back"
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
                <div className="font-bold">{content.plan12w}</div>
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">{content.prices["12week"].original}</span>{" "}
                  <span className="text-orange-600 font-bold">{content.prices["12week"].final}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{content.prices["12week"].daily}</div>
                <div className="text-xs text-muted-foreground">{content.perDay}</div>
              </div>
            </div>
          </button>

          <div className="space-y-4 pt-3">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
              data-testid="button-start-plan-back"
            >
              {content.cta}
            </button>

            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-orange-700 dark:text-orange-400">{content.guarantee}</span>
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {content.guaranteeText}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{content.secure}</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{content.noHidden}</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{content.easyCancel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-center font-mono mb-4">
            {content.faqTitle}
          </h3>
          {content.faqs.map((faq, idx) => (
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
        isBackOffer={true}
      />
    </div>
  );
}
