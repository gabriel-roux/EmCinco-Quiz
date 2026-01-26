import { useState, useEffect } from "react";
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

// Copy dinâmica baseada no perfil
const profileCopy = {
  emocional: {
    headline: "Você não está falhando.",
    headlineHighlight: "Seu cérebro só está sobrecarregado.",
    subheadline:
      "Quando a mente está cansada, até pessoas inteligentes travam, desistem e se sabotam sem perceber.",
    identificationIntro: "Se você sente que:",
    identification: [
      "Começa empolgado e depois abandona em silêncio",
      "Passa o dia ocupado, mas sem progresso real",
      "Vai dormir com a sensação de que podia ter feito mais",
    ],
    identificationConclusion:
      "…isso não é falta de disciplina. É excesso mental.",
    guiltBreak:
      "Quando tudo parece grande demais, o cérebro entra em modo de defesa. Ele evita começar para te proteger do estresse, não porque você é fraco.",
    presentation:
      "O EmCinco foi criado para contornar esse bloqueio, não para exigir força de vontade que você não tem sobrando.",
    mechanismIntro: "Por isso o método funciona:",
    mechanism: [
      "Apenas 5 minutos (o cérebro aceita)",
      "Zero decisões (nada para planejar)",
      "Zero sobrecarga mental",
      "Progresso visível todos os dias",
    ],
    lossFrame:
      "Se nada mudar, o padrão se repete: você tenta, se cobra, desiste — e a confiança em si mesmo diminui um pouco mais a cada ciclo.",
    cta: "Começar meu plano de 5 minutos",
    microcopy:
      "Sem pressão. Sem promessas irreais. Apenas um sistema simples para destravar consistência.",
  },
  racional: {
    headline: "O que está sabotando seu foco não é falta de disciplina",
    headlineHighlight: "é sua mente sobrecarregada.",
    subheadline:
      "Em 5 minutos por dia, o EmCinco reconstrói seu foco e cria progresso automático, sem depender de motivação.",
    identification: [
      "Quebra promessas consigo mesma toda semana",
      "Começa empolgada e abandona em silêncio",
      "Está mentalmente cansada antes mesmo de começar",
    ],
    identificationIntro: "A maioria das pessoas falha porque:",
    identificationConclusion: "",
    guiltBreak: "",
    presentation:
      "O EmCinco resolve isso criando um loop diário impossível de falhar:",
    mechanism: [
      "Missões de 5 minutos que seu cérebro aceita",
      "Zero decisões (você só executa)",
      "Progresso visível desde o primeiro dia",
      "Reforço positivo que te faz querer continuar",
    ],
    cta: "Quero voltar a ter constância",
    microcopy: "Leva menos tempo do que rolar o Instagram.",
  },
};

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

  const faqs = [
    {
      question: "Por que a abordagem EmCinco funciona?",
      answer:
        "Nosso plano ajuda você a construir habitos de forma mais profunda, com mais energia e foco. Combinamos tecnicas comprovadas de mudança comportamental com orientação personalizada. Você recebe instruções passo a passo e rotinas que levam apenas 5 minutos por dia.",
    },
    {
      question: "Como este plano pode me ajudar?",
      answer:
        "O EmCinco foi desenvolvido para eliminar a fadiga de decisão e criar momentum consistente. Você vai notar mais clareza mental, energia estavel e progresso visível em suas metas.",
    },
    {
      question: "Quando vou começar a sentir os efeitos?",
      answer:
        "A maioria dos usuarios relata mudancas notáveis na primeira semana. Os maiores benefícios aparecem após 21 dias de prática consistente.",
    },
    {
      question: "E baseado em ciência?",
      answer:
        "Sim! O EmCinco e baseado em pesquisas de psicologia comportamental, neurociência e formação de habitos de instituições como Stanford, MIT e Harvard.",
    },
  ];

  const comparisonItems = [
    "Foco inabalável",
    "Consistência diária",
    "Clareza de metas",
    "Evolução contínua",
    "Resultados práticos",
  ];

  const testimonials = [
    {
      name: "Eduardo Vasconcelos",
      text: "Antes eu começava vários cursos e abandonava na segunda semana. Com o EmCinco, consegui manter consistência pela primeira vez. Em pouco mais de um mês já estava aplicando conceitos de tecnologia no meu trabalho.",
    },
    {
      name: "Camila Nogueira",
      text: "Eu sempre achei que aprender algo novo exigia muito tempo livre (que eu não tenho). Os 5 minutos por dia mudaram completamente isso. Hoje estudar faz parte da minha rotina, como escovar os dentes.",
    },
    {
      name: "Felipe Arantes",
      text: "O maior ganho pra mim foi a clareza. Parei de pular de conteúdo em conteúdo sem direção. Agora sigo um caminho estruturado e vejo progresso real toda semana.",
    },
  ];

  const goals = [
    "Você desenvolve novas habilidades em apenas 5 minutos por dia",
    "Sua consistência se torna automática e sem esforço",
    "Você não é mais paralisado por indecisão ou procrastinação",
    "Você se sente focado, confiante e pronto para evoluir",
    "Seu aprendizado se torna fluido, diário e prazeroso",
    "Você passa o dia com clareza mental e motivação constante",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-red-600 text-white py-3 px-4 text-center text-sm font-medium shadow-md flex justify-center items-center gap-2">
        <span>
          Vagas limitadas para o plano de 4 semanas. Restam{" "}
          <span className="font-bold">7</span> acessos e{" "}
          <b>
            Encerra em {time.mins}:{time.secs}
          </b>
        </span>
      </div>

      <main className="max-w-lg mx-auto px-4 pb-8 pt-8 space-y-6">
        {/* Badge de perfil personalizado */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Zap className="w-3 h-3" />
            Plano adaptado ao seu perfil
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-2xl md:text-3xl font-handwritten font-extrabold leading-tight">
            {copy.headline}{" "}
            <span
              className={
                profile === "emocional" ? "text-red-500" : "text-primary"
              }
            >
              {copy.headlineHighlight}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">{copy.subheadline}</p>
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

          <div className="flex flex-row gap-4 px-6 items-start">
            <div className="flex-1 space-y-4 min-w-0">
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  Nível de Foco
                </div>
                <div className="font-bold text-[11px] text-foreground leading-tight">
                  Disperso
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  Consistência
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  Travada
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-1/4 bg-primary rounded-full" />
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  Clareza Mental
                </div>
                <div className="font-bold text-[11px] text-foreground">
                  Irregular
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-2/5 bg-primary rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 min-w-0 text-right">
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  Nível de Foco
                </div>
                <div className="font-bold text-[11px] text-primary leading-tight">
                  Afiado
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  Consistência
                </div>
                <div className="font-bold text-[11px] text-primary leading-tight">
                  Fluindo
                </div>
                <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" />
                </div>
              </div>
              <div className="min-h-[45px]">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 whitespace-nowrap">
                  Clareza Mental
                </div>
                <div className="font-bold text-[11px] text-primary">Pico</div>
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
                <div className="font-bold">Plano 1 Semana</div>
                <div className="text-sm text-muted-foreground">R$10,49</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">R$1,5</div>
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
                  <div className="font-bold text-black">Plano 4 Semanas</div>
                  <div
                    className={cn(
                      "text-sm",
                      selectedPlan === "4week"
                        ? "text-black/80"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="line-through text-red-500">R$49,99</span>{" "}
                    R$19,99
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-black">R$0,71</div>
                  <div
                    className={cn(
                      "text-xs",
                      selectedPlan === "4week"
                        ? "text-black/80"
                        : "text-muted-foreground",
                    )}
                  >
                    por dia
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
                <div className="font-bold">Plano 12 Semanas</div>
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">R$99,99</span> R$34,99
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">R$0,41</div>
                <div className="text-xs text-muted-foreground">por dia</div>
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
                  Garantia de 30 dias
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Se você não sentir progresso real, devolvemos 100% do seu
                dinheiro.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
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

        <div className="text-center text-sm text-muted-foreground mt-2">
          +3.812 pessoas usando o método EmCinco™ para destravar foco e
          consistência.
        </div>
        <div className="space-y-4">
          {testimonials.map((t, idx) => (
            <Testimonial key={idx} name={t.name} text={t.text} />
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-center font-handwritten mb-4">
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

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center font-handwritten text-foreground">
            Alcance seu pico com EmCinco
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-3 bg-muted/50 text-center text-xs font-semibold py-3">
              <div></div>
              <div className="text-muted-foreground">
                Sem
                <br />
                EmCinco
              </div>
              <div className="text-teal-600 dark:text-teal-400">
                Usando
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
            *resultados individuais podem variar
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
                <div className="font-bold">Plano 1 Semana</div>
                <div className="text-sm text-muted-foreground">R$10,49</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">R$1,5</div>
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
                  <div className="font-bold text-black">Plano 4 Semanas</div>
                  <div
                    className={cn(
                      "text-sm",
                      selectedPlan === "4week"
                        ? "text-black/80"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="line-through text-red-500">R$49,99</span>{" "}
                    R$19,99
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-black">R$0,71</div>
                  <div
                    className={cn(
                      "text-xs",
                      selectedPlan === "4week"
                        ? "text-black/80"
                        : "text-muted-foreground",
                    )}
                  >
                    por dia
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
                <div className="font-bold">Plano 12 Semanas</div>
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">R$99,99</span> R$34,99
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">R$0,41</div>
                <div className="text-xs text-muted-foreground">por dia</div>
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
