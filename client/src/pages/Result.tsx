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

export default function Result() {
  const [selectedPlan, setSelectedPlan] = useState<
    "1week" | "4week" | "12week"
  >("4week");
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const generatePlan = useGeneratePlan();

  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      mins: mins.toString().padStart(2, "0"),
      secs: secs.toString().padStart(2, "0"),
    };
  };

  useEffect(() => {
    const savedAnswers = localStorage.getItem("quickhabit_answers");
    const savedName = localStorage.getItem("quickhabit_name");

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
      question: "Por que a abordagem QUICKHABIT funciona?",
      answer:
        "Nosso plano ajuda voce a construir habitos de forma mais profunda, com mais energia e foco. Combinamos tecnicas comprovadas de mudanca comportamental com orientacao personalizada. Voce recebe instrucoes passo a passo e rotinas que levam apenas 5 minutos por dia.",
    },
    {
      question: "Como este plano pode me ajudar?",
      answer:
        "O QUICKHABIT foi desenvolvido para eliminar a fadiga de decisao e criar momentum consistente. Voce vai notar mais clareza mental, energia estavel e progresso visivel em suas metas.",
    },
    {
      question: "Quando vou comecar a sentir os efeitos?",
      answer:
        "A maioria dos usuarios relata mudancas notaveis na primeira semana. Os maiores beneficios aparecem apos 21 dias de pratica consistente.",
    },
    {
      question: "E baseado em ciencia?",
      answer:
        "Sim! O QUICKHABIT e baseado em pesquisas de psicologia comportamental, neurociencia e formacao de habitos de instituicoes como Stanford, MIT e Harvard.",
    },
  ];

  const comparisonItems = [
    "Acordar renovado",
    "Energia estavel",
    "Foco preciso",
    "Alta motivacao",
    "Recuperacao forte",
  ];

  const testimonials = [
    {
      name: "Amanda S.",
      text: "Estou seguindo o plano QUICKHABIT ha alguns meses, e a diferenca e dia e noite. Eu costumava me sentir constantemente cansada e dispersa. Agora acordo com energia, fico focada o dia todo e finalmente sinto que estou no controle da minha rotina.",
    },
    {
      name: "Bruno R.",
      text: "O QUICKHABIT me ajudou a entender por que eu estava constantemente esgotado e mentalmente nublado. Os planos tornaram facil melhorar meu sono e energia, e e algo que realmente quero fazer todos os dias.",
    },
    {
      name: "Tila W.",
      text: "Meu coach me recomendou o QUICKHABIT, e estou muito feliz por ter ouvido. O que se destacou foi como o plano e facil de seguir. Sem enrolacao, apenas estrategias praticas que se encaixam na minha vida.",
    },
  ];

  const goals = [
    "Voce acorda se sentindo verdadeiramente descansado e recarregado",
    "Sua energia permanece estavel da manha a noite",
    "Voce nao e mais desacelerado por nevoa mental ou fadiga",
    "Voce se sente claro, focado e pronto para performar",
    "Seu descanso se torna profundo, consistente e revigorante",
    "Voce passa o dia com alta confianca e motivacao",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-[#1a1a2e] text-white py-3 px-4 text-center text-sm font-medium shadow-md flex justify-center items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span>
          Bonus de lancamento reservado por {time.mins}:{time.secs}
        </span>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-8 space-y-8">
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

          <div className="grid grid-cols-2 gap-4 px-6 pb-6">
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Estresse Fisico
                </div>
                <div className="font-bold text-sm text-foreground">Sobrecarregado</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Bateria Corporal
                </div>
                <div className="font-bold text-sm text-foreground">Baixa</div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-1/4 bg-primary rounded-full" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Nivel de Energia
                </div>
                <div className="font-bold text-sm text-foreground">Esgotado</div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-2/5 bg-primary rounded-full" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Estresse Fisico
                </div>
                <div className="font-bold text-sm text-primary">Equilibrado</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Bateria Corporal
                </div>
                <div className="font-bold text-sm text-primary leading-tight">
                  Totalmente recarregada
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
                  Nivel de Energia
                </div>
                <div className="font-bold text-sm text-primary">Pico</div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full w-full bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900">
            <h3 className="font-bold text-orange-700 dark:text-orange-400 mb-3 text-sm">
              Caminho Atual
            </h3>
            <ul className="space-y-2.5 text-sm text-orange-600 dark:text-orange-300">
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0" /> Esforco
                inconsistente
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0" /> Nevoa mental
              </li>
              <li className="flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0" /> Fadiga de decisao
              </li>
            </ul>
          </div>
          <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
            <h3 className="font-bold text-green-700 dark:text-green-400 mb-3 text-sm">
              Meta QUICKHABIT
            </h3>
            <ul className="space-y-2.5 text-sm text-green-600 dark:text-green-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> Habito de 5
                min
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> Foco Laser
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> Progresso
                Claro
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold leading-tight">
            Seu Plano de Recuperacao Personalizado esta{" "}
            <span className="text-primary">Pronto!</span>
          </h1>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 flex-col gap-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-green-700 dark:text-green-400">
              Codigo Promocional Aplicado
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-medium">quickhabit_jan26</span>
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

        <div className="flex items-center justify-around">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">
                Sinais fisicos
              </div>
              <div className="font-semibold">Baixa energia</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">
                Recuperacao alvo
              </div>
              <div className="font-semibold">94%</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setSelectedPlan("1week")}
            className={cn(
              "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
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
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">R$49,99</span> R$10,50
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">R$1,50</div>
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

          <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
            Ao continuar, voce concorda que se nao cancelar antes do final das{" "}
            <strong>4 semanas</strong> da oferta introdutoria, sera cobrado
            automaticamente o valor total de{" "}
            <strong>R$49,99 a cada 4 semanas</strong> ate cancelar. Saiba mais
            sobre cancelamento e politica de reembolso em{" "}
            <span className="underline">Termos de Assinatura</span>.
          </p>

          <div className="space-y-4 pt-3 pb-8">
            <button
              className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
              data-testid="button-start-plan"
            >
              COMECAR MEU PLANO
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center font-heading">
            Nossos Objetivos
          </h3>
          <div className="space-y-4">
            {goals.map((goal, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-foreground">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-2xl p-6 text-center space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Como visto em
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="text-xl font-bold text-muted-foreground/60">
              USA TODAY
            </span>
            <span className="text-2xl font-black italic text-muted-foreground/60">
              Vox
            </span>
            <span className="text-xl font-bold text-muted-foreground/60">
              Forbes
            </span>
            <span className="text-lg font-black text-muted-foreground/60 tracking-tight">
              NEW YORK POST
            </span>
            <span className="text-lg font-semibold text-muted-foreground/60">
              well+good
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-center font-heading mb-4">
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
          <h3 className="text-2xl font-bold text-center font-heading text-foreground">
            Alcance seu pico com QUICKHABIT
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-3 bg-muted/50 text-center text-xs font-semibold py-3">
              <div></div>
              <div className="text-muted-foreground">
                Sem
                <br />
                QUICKHABIT
              </div>
              <div className="text-teal-600 dark:text-teal-400">
                Usando
                <br />
                QUICKHABIT
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
          <h3 className="text-2xl font-bold text-center font-heading">
            O que as pessoas estao dizendo sobre o QUICKHABIT
          </h3>
          <div className="space-y-4">
            {testimonials.map((t, idx) => (
              <Testimonial key={idx} name={t.name} text={t.text} />
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold leading-tight">
            Seu Plano de Recuperacao Personalizado esta{" "}
            <span className="text-primary">Pronto!</span>
          </h1>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 flex-col gap-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-green-700 dark:text-green-400">
              Codigo Promocional Aplicado
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span className="font-medium">quickhabit_jan26</span>
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

        <div className="flex items-center justify-around">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">
                Sinais fisicos
              </div>
              <div className="font-semibold">Baixa energia</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">
                Recuperacao alvo
              </div>
              <div className="font-semibold">94%</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setSelectedPlan("1week")}
            className={cn(
              "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
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
                <div className="text-sm text-muted-foreground">
                  <span className="line-through">R$49,99</span> R$10,50
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">R$1,50</div>
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

          <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
            Ao continuar, voce concorda que se nao cancelar antes do final das{" "}
            <strong>4 semanas</strong> da oferta introdutoria, sera cobrado
            automaticamente o valor total de{" "}
            <strong>R$49,99 a cada 4 semanas</strong> ate cancelar. Saiba mais
            sobre cancelamento e politica de reembolso em{" "}
            <span className="underline">Termos de Assinatura</span>.
          </p>

          <div className="space-y-4 pt-3">
            <button
              className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
              data-testid="button-start-plan"
            >
              COMECAR MEU PLANO
            </button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-2xl p-6 text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-[#1a1a2e] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          </div>
          <h4 className="text-xl font-bold">Garantia de 30 Dias</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Acreditamos que nosso plano pode funcionar para voce e que voce vera
            resultados visiveis em 4 semanas! Estamos prontos para devolver seu
            dinheiro se voce nao ver resultados visiveis e puder demonstrar que
            seguiu nosso plano.
          </p>
          <p className="text-xs text-muted-foreground">
            Saiba mais sobre limitacoes aplicaveis em nossos{" "}
            <span className="underline cursor-pointer">
              Termos de Assinatura
            </span>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
