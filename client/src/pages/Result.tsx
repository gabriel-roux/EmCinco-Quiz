import { useState, useEffect, useMemo } from "react";
import {
  Check,
  X,
  Star,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  Rocket,
  Target,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGeneratePlan } from "@/hooks/use-plan";
import { type PlanResponse } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import tiredPhoto from "@assets/image_1767730709233.png";
import happyPhoto from "@assets/image_1767730696591.png";
import CheckoutModal from "@/components/CheckoutModal";
import ExitPopup from "@/components/ExitPopup";
import {
  trackEventWithId,
  sendServerEvent,
  getStoredEmail,
  getStoredName,
} from "@/lib/facebookPixel";
import { useLocale, pricing } from "@/lib/i18n";
import { landingContent } from "@/data/quizSteps";

// Componente de título animado para Results
interface ResultTitleProps {
  headline: string;
  highlight: string;
  isRed?: boolean;
}

function ResultTitle({ headline, highlight, isRed = false }: ResultTitleProps) {
  const fullText = `${headline} ${highlight}`;
  const words = fullText.split(" ");
  const totalWords = words.length;
  const lastWordDelay = 0.2 + ((totalWords - 1) * 0.08);
  const highlightDelay = lastWordDelay + 0.3;

  // Find highlight position
  const highlightStart = fullText.toLowerCase().indexOf(highlight.toLowerCase());
  const highlightEnd = highlightStart + highlight.length;

  const beforeText = fullText.substring(0, highlightStart).trim();
  const highlightText = fullText.substring(highlightStart, highlightEnd);
  
  const beforeWords = beforeText ? beforeText.split(" ") : [];
  const highlightWordsArray = highlightText.split(" ");
  
  let wordIndex = 0;

  return (
    <h1 className="text-2xl md:text-3xl font-mono font-extrabold leading-tight overflow-hidden">
      {/* Before words */}
      {beforeWords.map((word, i) => {
        const delay = 0.2 + (wordIndex * 0.08);
        wordIndex++;
        return (
          <motion.span
            key={`before-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay, ease: "easeOut" }}
            className="inline-block mr-[0.3em]"
          >
            {word}
          </motion.span>
        );
      })}
      {/* Highlight words - each word is inline with its own bg */}
      {highlightWordsArray.map((word, i) => {
        const delay = 0.2 + (wordIndex * 0.08);
        wordIndex++;
        return (
          <span key={`hl-wrap-${i}`} className="inline-block relative mr-[0.3em]">
            <span 
              className={isRed ? "highlight-block-bg-red" : "highlight-block-bg"}
              style={{ animationDelay: `${highlightDelay}s` }}
            />
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay, ease: "easeOut" }}
              className="inline-block relative z-10 text-white"
            >
              {word}
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
        data-testid={`faq-${question.slice(0, 20)}`}
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

// Tipo de perfil do checkout
type CheckoutProfile = "emocional" | "racional";
type Locale = "pt-BR" | "es";

// Copy dinâmica baseada no perfil e locale
function getProfileCopy(locale: Locale) {
  if (locale === "es") {
    return {
      emocional: {
        headline: "No estás fallando.",
        headlineHighlight: "Tu cerebro solo está sobrecargado.",
        subheadline:
          "Cuando la mente está cansada, hasta personas inteligentes se traban, desisten y se sabotean sin darse cuenta.",
        identificationIntro: "Si sientes que:",
        identification: [
          "Empiezas emocionado y después abandonas en silencio",
          "Pasas el día ocupado, pero sin progreso real",
          "Te vas a dormir con la sensación de que podrías haber hecho más",
        ],
        identificationConclusion:
          "...eso no es falta de disciplina. Es exceso mental.",
        guiltBreak:
          "Cuando todo parece demasiado grande, el cerebro entra en modo de defensa. Evita comenzar para protegerte del estrés, no porque seas débil.",
        presentation:
          "EmCinco fue creado para sortear ese bloqueo, no para exigir fuerza de voluntad que no tienes de sobra.",
        mechanismIntro: "Por eso el método funciona:",
        mechanism: [
          "Solo 5 minutos (el cerebro acepta)",
          "Cero decisiones (nada que planear)",
          "Cero sobrecarga mental",
          "Progreso visible todos los días",
        ],
        lossFrame:
          "Si nada cambia, el patrón se repite: intentas, te exiges, desistes - y la confianza en ti mismo disminuye un poco más con cada ciclo.",
        cta: "Comenzar mi plan de 5 minutos",
        microcopy:
          "Sin presión. Sin promesas irreales. Solo un sistema simple para desbloquear consistencia.",
      },
      racional: {
        headline: "Lo que está saboteando tu enfoque no es falta de disciplina",
        headlineHighlight: "es tu mente sobrecargada.",
        subheadline:
          "En 5 minutos al día, EmCinco reconstruye tu enfoque y crea progreso automático, sin depender de motivación.",
        identification: [
          "Rompe promesas consigo misma toda semana",
          "Empieza emocionada y abandona en silencio",
          "Está mentalmente cansada antes de empezar",
        ],
        identificationIntro: "La mayoría de las personas falla porque:",
        identificationConclusion: "",
        guiltBreak: "",
        presentation:
          "EmCinco resuelve esto creando un loop diario imposible de fallar:",
        mechanism: [
          "Misiones de 5 minutos que tu cerebro acepta",
          "Cero decisiones (solo ejecutas)",
          "Progreso visible desde el primer día",
          "Refuerzo positivo que te hace querer continuar",
        ],
        cta: "Quiero volver a tener constancia",
        microcopy: "Toma menos tiempo que scrollear Instagram.",
      },
    };
  }
  
  return {
    emocional: {
      headline: "Voce nao esta falhando.",
      headlineHighlight: "Seu cerebro so esta sobrecarregado.",
      subheadline:
        "Quando a mente esta cansada, ate pessoas inteligentes travam, desistem e se sabotam sem perceber.",
      identificationIntro: "Se voce sente que:",
      identification: [
        "Comeca empolgado e depois abandona em silencio",
        "Passa o dia ocupado, mas sem progresso real",
        "Vai dormir com a sensacao de que podia ter feito mais",
      ],
      identificationConclusion:
        "...isso nao e falta de disciplina. E excesso mental.",
      guiltBreak:
        "Quando tudo parece grande demais, o cerebro entra em modo de defesa. Ele evita comecar para te proteger do estresse, nao porque voce e fraco.",
      presentation:
        "O EmCinco foi criado para contornar esse bloqueio, nao para exigir forca de vontade que voce nao tem sobrando.",
      mechanismIntro: "Por isso o metodo funciona:",
      mechanism: [
        "Apenas 5 minutos (o cerebro aceita)",
        "Zero decisoes (nada para planejar)",
        "Zero sobrecarga mental",
        "Progresso visivel todos os dias",
      ],
      lossFrame:
        "Se nada mudar, o padrao se repete: voce tenta, se cobra, desiste - e a confianca em si mesmo diminui um pouco mais a cada ciclo.",
      cta: "Comecar meu plano de 5 minutos",
      microcopy:
        "Sem pressao. Sem promessas irreais. Apenas um sistema simples para destravar consistencia.",
    },
    racional: {
      headline: "O que esta sabotando seu foco nao e falta de disciplina",
      headlineHighlight: "e sua mente sobrecarregada.",
      subheadline:
        "Em 5 minutos por dia, o EmCinco reconstroi seu foco e cria progresso automatico, sem depender de motivacao.",
      identification: [
        "Quebra promessas consigo mesma toda semana",
        "Comeca empolgada e abandona em silencio",
        "Esta mentalmente cansada antes mesmo de comecar",
      ],
      identificationIntro: "A maioria das pessoas falha porque:",
      identificationConclusion: "",
      guiltBreak: "",
      presentation:
        "O EmCinco resolve isso criando um loop diario impossivel de falhar:",
      mechanism: [
        "Missoes de 5 minutos que seu cerebro aceita",
        "Zero decisoes (voce so executa)",
        "Progresso visivel desde o primeiro dia",
        "Reforco positivo que te faz querer continuar",
      ],
      cta: "Quero voltar a ter constancia",
      microcopy: "Leva menos tempo do que rolar o Instagram.",
    },
  };
}

export default function Result() {
  const [selectedPlan, setSelectedPlan] = useState<
    "1week" | "4week" | "12week"
  >("4week");
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const generatePlan = useGeneratePlan();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [profile, setProfile] = useState<CheckoutProfile>("racional");
  const { locale, currency, currencySymbol } = useLocale();
  const content = landingContent[locale];
  const profileCopy = useMemo(() => getProfileCopy(locale), [locale]);
  const prices = pricing[locale].regular;
  
  const formatPrice = (val: number) => {
    if (locale === "es") {
      return `${currencySymbol}${val.toFixed(2)}`;
    }
    return `${currencySymbol}${val.toFixed(2).replace(".", ",")}`;
  };

  const [timeLeft, setTimeLeft] = useState(600);

  // Ler perfil do localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem(
      "emcinco_checkout_profile",
    ) as CheckoutProfile;
    if (savedProfile === "emocional" || savedProfile === "racional") {
      setProfile(savedProfile);
    }
  }, []);

  const copy = profileCopy[profile];

  const handleExitIntent = () => {
    setShowCheckout(false);
    setShowExitPopup(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const email = getStoredEmail();
    const firstName = getStoredName();
    const contentId = `emcinco_${selectedPlan}`;

    const priceMap: Record<string, number> = {
      "1week": 10.5,
      "4week": 19.99,
      "12week": 34.99,
    };
    const value = priceMap[selectedPlan] || 19.99;

    const viewContentId = trackEventWithId("ViewContent", {
      content_name: "EmCinco Quiz Result",
      currency: "BRL",
      value,
      checkout_type: profile,
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
      {
        value,
        currency: "BRL",
        contentName: `EmCinco Quiz Result - ${profile}`,
      },
      viewContentId,
    );
    sendServerEvent(
      "InitiateCheckout",
      { email, firstName },
      {
        value,
        currency: "BRL",
        contentIds: [contentId],
        contentType: "product",
        numItems: 1,
      },
      initiateCheckoutId,
    );
  }, [selectedPlan, profile]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      mins: mins.toString().padStart(2, "0"),
      secs: secs.toString().padStart(2, "0"),
    };
  };

  useEffect(() => {
    const savedAnswers = localStorage.getItem("emcinco_answers");
    const savedName = localStorage.getItem("emcinco_name");

    if (savedAnswers && savedName && !planData) {
      generatePlan
        .mutateAsync({
          answers: JSON.parse(savedAnswers),
          name: savedName,
        })
        .then(setPlanData)
        .catch(console.error);
    }
  }, []);

  const time = formatTime(timeLeft);

  const faqs = useMemo(() => locale === "es" ? [
    {
      question: "¿Por qué funciona el enfoque EmCinco?",
      answer:
        "Nuestro plan te ayuda a construir hábitos de forma más profunda, con más energía y enfoque. Combinamos técnicas comprobadas de cambio conductual con orientación personalizada. Recibes instrucciones paso a paso y rutinas que toman solo 5 minutos al día.",
    },
    {
      question: "¿Cómo puede ayudarme este plan?",
      answer:
        "EmCinco fue desarrollado para eliminar la fatiga de decisión y crear momentum consistente. Notarás más claridad mental, energía estable y progreso visible en tus metas.",
    },
    {
      question: "¿Cuándo empezaré a sentir los efectos?",
      answer:
        "La mayoría de los usuarios reportan cambios notables en la primera semana. Los mayores beneficios aparecen después de 21 días de práctica consistente.",
    },
    {
      question: "¿Está basado en ciencia?",
      answer:
        "¡Sí! EmCinco está basado en investigaciones de psicología conductual, neurociencia y formación de hábitos de instituciones como Stanford, MIT y Harvard.",
    },
  ] : [
    {
      question: "Por que a abordagem EmCinco funciona?",
      answer:
        "Nosso plano ajuda voce a construir habitos de forma mais profunda, com mais energia e foco. Combinamos tecnicas comprovadas de mudanca comportamental com orientacao personalizada. Voce recebe instrucoes passo a passo e rotinas que levam apenas 5 minutos por dia.",
    },
    {
      question: "Como este plano pode me ajudar?",
      answer:
        "O EmCinco foi desenvolvido para eliminar a fadiga de decisao e criar momentum consistente. Voce vai notar mais clareza mental, energia estavel e progresso visivel em suas metas.",
    },
    {
      question: "Quando vou comecar a sentir os efeitos?",
      answer:
        "A maioria dos usuarios relata mudancas notaveis na primeira semana. Os maiores beneficios aparecem apos 21 dias de pratica consistente.",
    },
    {
      question: "E baseado em ciencia?",
      answer:
        "Sim! O EmCinco e baseado em pesquisas de psicologia comportamental, neurociencia e formacao de habitos de instituicoes como Stanford, MIT e Harvard.",
    },
  ], [locale]);

  const comparisonItems = useMemo(() => locale === "es" ? [
    "Enfoque inquebrantable",
    "Consistencia diaria",
    "Claridad de metas",
    "Evolución continua",
    "Resultados prácticos",
  ] : [
    "Foco inabalavel",
    "Consistencia diaria",
    "Clareza de metas",
    "Evolucao continua",
    "Resultados praticos",
  ], [locale]);

  const testimonials = useMemo(() => locale === "es" ? [
    {
      name: "Eduardo Vasconcelos",
      text: "Antes empezaba varios cursos y los abandonaba en la segunda semana. Con EmCinco, logré mantener consistencia por primera vez. En poco más de un mes ya estaba aplicando conceptos de tecnología en mi trabajo.",
    },
    {
      name: "Camila Nogueira",
      text: "Siempre pensé que aprender algo nuevo requería mucho tiempo libre (que no tengo). Los 5 minutos al día cambiaron completamente eso. Hoy estudiar es parte de mi rutina, como cepillarme los dientes.",
    },
    {
      name: "Felipe Arantes",
      text: "La mayor ganancia para mí fue la claridad. Dejé de saltar de contenido en contenido sin dirección. Ahora sigo un camino estructurado y veo progreso real cada semana.",
    },
  ] : [
    {
      name: "Eduardo Vasconcelos",
      text: "Antes eu comecava varios cursos e abandonava na segunda semana. Com o EmCinco, consegui manter consistencia pela primeira vez. Em pouco mais de um mes ja estava aplicando conceitos de tecnologia no meu trabalho.",
    },
    {
      name: "Camila Nogueira",
      text: "Eu sempre achei que aprender algo novo exigia muito tempo livre (que eu nao tenho). Os 5 minutos por dia mudaram completamente isso. Hoje estudar faz parte da minha rotina, como escovar os dentes.",
    },
    {
      name: "Felipe Arantes",
      text: "O maior ganho pra mim foi a clareza. Parei de pular de conteudo em conteudo sem direcao. Agora sigo um caminho estruturado e vejo progresso real toda semana.",
    },
  ], [locale]);

  const goals = useMemo(() => locale === "es" ? [
    "Desarrollas nuevas habilidades en solo 5 minutos al día",
    "Tu consistencia se vuelve automática y sin esfuerzo",
    "Ya no estás paralizado por indecisión o procrastinación",
    "Te sientes enfocado, confiado y listo para evolucionar",
    "Tu aprendizaje se vuelve fluido, diario y placentero",
    "Pasas el día con claridad mental y motivación constante",
  ] : [
    "Voce desenvolve novas habilidades em apenas 5 minutos por dia",
    "Sua consistencia se torna automatica e sem esforco",
    "Voce nao e mais paralisado por indecisao ou procrastinacao",
    "Voce se sente focado, confiante e pronto para evoluir",
    "Seu aprendizado se torna fluido, diario e prazeroso",
    "Voce passa o dia com clareza mental e motivacao constante",
  ], [locale]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-red-600 text-white py-3 px-4 text-center text-sm font-medium shadow-md flex justify-center items-center gap-2">
        <span>
          {content.limitedSpots} {content.spotsRemaining}{" "}
          <span className="font-bold">7</span> {content.accessesAnd}{" "}
          <b>
            {content.endsIn} {time.mins}:{time.secs}
          </b>
        </span>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8 pt-8 space-y-6">
        {/* Badge de perfil personalizado */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Zap className="w-3 h-3" />
            {content.adaptedPlan}
          </div>
        </div>

        <div className="text-center space-y-3 overflow-hidden">
          <ResultTitle 
            headline={copy.headline}
            highlight={copy.headlineHighlight}
            isRed={profile === "emocional"}
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="text-muted-foreground text-sm"
          >
            {copy.subheadline}
          </motion.p>
        </div>

        {/* Bloco de identificação dinâmico */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <p className="font-medium text-foreground">
            {copy.identificationIntro}
          </p>
          <ul className="space-y-2">
            {copy.identification.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-muted-foreground text-sm"
              >
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
          {copy.identificationConclusion && (
            <p className="font-semibold text-foreground pt-2">
              {copy.identificationConclusion}
            </p>
          )}
          {copy.guiltBreak && (
            <p className="text-muted-foreground text-sm border-t border-border pt-3 mt-3">
              {copy.guiltBreak}
            </p>
          )}
        </div>

        {/* Apresentação do EmCinco */}
        <div className="text-center">
          <p className="text-foreground font-medium">{copy.presentation}</p>
        </div>

        {/* Mecanismo EmCinco™ */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
          <h3 className="font-bold text-center mb-4">Mecanismo EmCinco™</h3>
          <div className="grid grid-cols-2 gap-3">
            {copy.mechanism.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

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

          <div className="flex flex-row gap-4 px-6 items-start">
            <div className="flex-1 space-y-4 min-w-0">
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  {content.focusLevel}
                </div>
                <div className="font-bold text-[11px] text-foreground leading-tight">
                  {content.dispersed}
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  {content.consistency}
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  {content.stuck}
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-1/4 bg-primary rounded-full" />
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  {content.mentalClarity}
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  {content.irregular}
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-2/5 bg-primary rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 min-w-0 text-right">
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  {content.focusLevel}
                </div>
                <div className="font-bold text-[11px] text-primary leading-tight">
                  {content.sharp}
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  {content.consistency}
                </div>
                <div className="font-bold text-[11px] text-primary leading-tight">
                  {content.automatic}
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" />
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  {content.mentalClarity}
                </div>
                <div className="font-bold text-[11px] text-primary">{content.stable}</div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/15 border border-primary rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-lg text-center">
            O que você recebe HOJE:
          </h3>
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
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>Acesso ao painel privado</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>Suporte por WhatsApp</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>Acesso ao grupo de network</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Código promocional aplicado!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium uppercase">emcinco_jan26</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">
                {time.mins}:{time.secs}
              </span>
              <div className="text-xs text-muted-foreground">
                {content.minutes || "minutos"} {content.seconds || "segundos"}
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
            data-testid="plan-1week"
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
                <div className="font-bold">{content.plan1week}</div>
                <div className="text-sm text-muted-foreground">{formatPrice(prices["1week"].price)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{formatPrice(prices["1week"].daily)}</div>
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
                  ? "border-primary bg-primary/15 text-white"
                  : "border-border bg-card",
              )}
              data-testid="plan-4week"
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
                  <div className="font-bold text-black">{content.plan4week}</div>
                  <div
                    className={cn(
                      "text-sm",
                      selectedPlan === "4week"
                        ? "text-black/80"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="line-through text-red-500">{formatPrice(prices["4week"].original)}</span>{" "}
                    {formatPrice(prices["4week"].price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-black">{formatPrice(prices["4week"].daily)}</div>
                  <div
                    className={cn(
                      "text-xs",
                      selectedPlan === "4week"
                        ? "text-black/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {content.perDay}
                  </div>
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
            data-testid="plan-12week"
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
                <div className="font-bold">{content.plan12week}</div>
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">{formatPrice(prices["12week"].original)}</span> {formatPrice(prices["12week"].price)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{formatPrice(prices["12week"].daily)}</div>
                <div className="text-xs text-muted-foreground">{content.perDay}</div>
              </div>
            </div>
          </button>

          <div className="space-y-3 pt-3">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
              data-testid="button-start-plan"
            >
              {copy.cta.toUpperCase()}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              {copy.microcopy}
            </p>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <span className="font-bold text-green-700 dark:text-green-400">
                  {content.guarantee30}
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                {content.guaranteeText}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>{content.securePayment2}</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{content.noHiddenSubscription}</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{content.easyCancellation}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-2">
          {content.peopleUsing}
        </div>
        <div className="space-y-4">
          {testimonials.map((t, idx) => (
            <Testimonial key={idx} name={t.name} text={t.text} />
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-center font-mono mb-4">
            {content.commonQuestions}
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

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center font-mono text-foreground">
            {content.reachPeak}
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-3 bg-muted/50 text-center text-xs font-semibold py-3">
              <div></div>
              <div className="text-muted-foreground">
                {content.without}
                <br />
                EmCinco
              </div>
              <div className="text-teal-600 dark:text-teal-400">
                {content.with}
                <br />
                EmCinco
              </div>
            </div>
            {comparisonItems.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "grid grid-cols-3 items-center py-4 px-4",
                  idx % 2 === 0 ? "bg-card" : "bg-muted/30",
                )}
              >
                <div className="text-sm font-medium">{item}</div>
                <div className="flex justify-center">
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <Check className="w-4 h-4 text-teal-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            *{locale === "es" ? "resultados individuales pueden variar" : "resultados individuais podem variar"}
          </p>
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
            data-testid="plan-1week"
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
                <div className="font-bold">{content.plan1week}</div>
                <div className="text-sm text-muted-foreground">{formatPrice(prices["1week"].price)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{formatPrice(prices["1week"].daily)}</div>
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
                  ? "border-primary bg-primary/15 text-white"
                  : "border-border bg-card",
              )}
              data-testid="plan-4week"
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
                  <div className="font-bold text-black">{content.plan4week}</div>
                  <div
                    className={cn(
                      "text-sm",
                      selectedPlan === "4week"
                        ? "text-black/80"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="line-through text-red-500">{formatPrice(prices["4week"].original)}</span>{" "}
                    {formatPrice(prices["4week"].price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-black">{formatPrice(prices["4week"].daily)}</div>
                  <div
                    className={cn(
                      "text-xs",
                      selectedPlan === "4week"
                        ? "text-black/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {content.perDay}
                  </div>
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
            data-testid="plan-12week"
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
                <div className="font-bold">{content.plan12week}</div>
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">{formatPrice(prices["12week"].original)}</span> {formatPrice(prices["12week"].price)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{formatPrice(prices["12week"].daily)}</div>
                <div className="text-xs text-muted-foreground">{content.perDay}</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
            data-testid="button-start-plan"
          >
            {copy.cta.toUpperCase()}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {copy.microcopy}
          </p>
        </div>
      </main>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        selectedPlan={selectedPlan}
        onExitIntent={handleExitIntent}
      />

      <ExitPopup
        isOpen={showExitPopup}
        onClose={() => setShowExitPopup(false)}
        onContinue={() => setShowExitPopup(false)}
      />
    </div>
  );
}
