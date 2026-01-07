import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Layout } from "@/components/Layout";
import {
  OptionCard,
  LikertScale,
  BottomBar,
  QuestionHeader,
  OptimizedImage,
  StatCard,
  ProgressBar,
  TimelineItem,
} from "@/components/QuizComponents";
import {
  Target,
  Sparkles,
  Timer,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Laptop, Clock, Brain, CheckCircle, Zap } from "lucide-react";
import { useCreateLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";

import batteryLowImg from "@assets/generated_images/tired_person_with_dead_battery_phone_illustration.png";
import researchImg from "@assets/generated_images/scientific_behavioral_research_logos_illustration.png";
import engineImg from "@assets/generated_images/flat_minimal_adaptive_engine_illustration.png";
import profileImg from "@assets/generated_images/flat_minimal_comparison_avatars_illustration.png";
import growthImg from "@assets/generated_images/flat_minimal_growth_chart_illustration.png";

interface QuizStep {
  id?: string;
  type: string;
  question?: string;
  options?: string[];
  statement?: string;
  sub?: string;
  title?: string;
  text?: string;
  visual?: string;
  image?: string;
  inputType?: string;
  placeholder?: string;
  note?: string;
  icon?: React.ReactNode;
}

interface QuizAnswers {
  [key: string]: any;
}

const steps: QuizStep[] = [
  { type: "landing" },

  {
    id: "age",
    type: "single",
    question: "Qual é a sua idade?",
    options: ["18–24", "25–34", "35–44", "45–54", "55+"],
  },

  {
    id: "struggle",
    type: "single",
    question:
      "Sinceramente... o que geralmente acontece quando você tenta aprender algo novo?",
    options: [
      "Começo, mas me distraio fácil",
      "Penso demais e nunca começo",
      "Sou consistente, mas ando devagar",
      "Nem sei por onde começar",
      "Não tenho tempo para aprender",
    ],
  },

  {
    id: "consistency_likert",
    type: "likert",
    statement: "Eu tenho potencial, só não consigo manter a consistência.",
    sub: "Você concorda com essa afirmação?",
  },
  {
    id: "focus_likert",
    type: "likert",
    statement:
      "Quando eu realmente foco, eu vou longe. O difícil é entrar no foco.",
    sub: "Você concorda com essa afirmação?",
  },

  {
    id: "focus_blockers",
    type: "single",
    question:
      "Hoje em dia, qual é o seu maior desafio de foco e produtividade?",
    options: [
      "Dificuldade em manter foco por longos períodos",
      "Mente dispersa ou me distraio fácil",
      "Procrastinação e falta de clareza",
      "Fadiga mental no fim do dia",
    ],
  },

  {
    id: "autopilot_likert",
    type: "likert",
    statement: "Sinto que meus dias acontecem no piloto automático.",
    sub: "Você concorda?",
  },

  {
    id: "typical_day",
    type: "single",
    question: "Como você descreveria um dia típico na sua vida?",
    options: [
      "Sempre corrido, sem tempo para nada",
      "Ocupado, mas administrável",
      "Calmo, porém sem foco",
      "Caótico e imprevisível",
    ],
  },

  {
    id: "screen_distraction",
    type: "single",
    question: "Com que frequência o celular rouba a sua atenção?",
    options: ["O tempo todo", "Frequentemente", "Às vezes", "Raramente"],
  },

  {
    id: "dedicated_time",
    type: "single",
    question: "Quanto tempo por dia você pode dedicar para evoluir?",
    options: [
      "2 minutos",
      "5 minutos (Recomendado)",
      "10 minutos",
      "15 minutos",
    ],
  },

  {
    id: "routine_chaos",
    type: "single",
    question: "Como você se sente em relação ao seu progresso atual?",
    options: [
      "Estou estagnado e sem direção",
      "Começo muitas coisas e não termino",
      "Sinto que poderia render muito mais",
      "Estou bem, mas quero melhorar",
    ],
  },

  {
    id: "fix_priority",
    type: "multi",
    question: "O que você quer melhorar primeiro?",
    options: [
      "Disciplina",
      "Foco",
      "Confiança",
      "Consistência",
      "Carreira / Dinheiro",
      "Criatividade",
      "Ansiedade",
      "Energia",
    ],
  },

  {
    id: "story_1",
    type: "info",
    title: "Seu problema não é preguiça.",
    text: "Se aprender parece difícil, é porque o seu sistema está sobrecarregado: atenção dispersa, metas confusas e decisões demais. O método XP5™ reconstrói esse sistema em apenas 5 minutos por dia.",
    visual: "image",
    image: batteryLowImg,
  },
  {
    id: "suffering_area",
    type: "multi",
    question: "O que mais sofre quando sua consistência falha?",
    options: [
      "Carreira e promoções",
      "Confiança pessoal",
      "Renda e finanças",
      "Relacionamentos",
      "Saúde mental",
      "Criatividade",
      "Motivação",
    ],
  },

  {
    id: "skill_interest",
    type: "single",
    question: "Que tipo de habilidade te interessa mais?",
    options: [
      "Tecnologia e IA",
      "Comunicação",
      "Negócios",
      "Criatividade",
      "Mente e Corpo",
      "Idiomas",
    ],
  },

  {
    id: "learning_style",
    type: "single",
    question: "Como você aprende melhor?",
    options: [
      "Microlições rápidas",
      "Passo a passo",
      "Leitura",
      "Prática",
      "Um pouco de tudo",
    ],
  },

  {
    id: "bad_habits",
    type: "multi",
    question: "Quais hábitos estão te atrapalhando?",
    options: [
      "Dormir tarde",
      "Tempo de tela",
      "Rolar feed infinito",
      "Pular treinos",
      "Açúcar",
      "Procrastinação",
      "Pensar demais",
      "Nenhum",
    ],
  },

  {
    id: "authority_info",
    type: "info",
    title: "Fundamentado em neurociência. ",
    text: "O XP5™ combina micro-hábitos, ambiente certos e pequenos reforços de dopamina, deixando sua evolução fácil e natural.",
    visual: "image",
    image: researchImg,
  },

  {
    id: "app_experience",
    type: "single",
    question: "Você já tentou outros métodos de produtividade?",
    options: [
      "Sim, mas desisti",
      "Sim, ainda uso alguns",
      "Não, estou começando agora",
    ],
  },

  {
    id: "expert_review",
    type: "info",
    title: "Missões diárias personalizadas.",
    text: "Com base nas suas respostas, criamos uma trilha única com missões de 5 minutos que se adaptam ao seu ritmo. Sem esforço. Sem decisões. Apenas seguir o plano.",
    visual: "image",
    image: engineImg,
  },

  {
    id: "outcome_desire",
    type: "multi",
    question: "Como sua vida melhora quando você resolve isso?",
    options: [
      "Melhor desempenho",
      "Mais dinheiro",
      "Mais confiança",
      "Foco afiado",
      "Menos ansiedade",
      "Criatividade",
      "Disciplina real",
    ],
  },

  {
    id: "habit_stacking_info",
    type: "info",
    title: "Sua jornada de 4 semanas está sendo criada.",
    text: "Estamos analisando seu perfil e montando uma trilha que elimina a procrastinação e coloca você em modo de evolução constante.",
    visual: "image",
    image: profileImg,
  },

  {
    id: "profile_summary",
    type: "summary",
    title: "Análise de Perfil Concluída",
    text: "Você precisa de micro-hábitos consistentes. Seu plano priorizará missões curtas para evitar sobrecarga e manter você avançando todos os dias.",
    image: profileImg,
  },

  {
    id: "commitment_time",
    type: "single",
    question:
      "Quanto tempo você quer dedicar diariamente ao seu plano QUICKHABIT?",
    options: ["5 min", "10 min", "15 min", "20 min"],
  },

  {
    id: "timeline_view",
    type: "timeline",
    title:
      "Apartir de agora, esse será o ultimo plano que você irá precisar para aprender algo novo.",
    image: growthImg,
  },

  {
    id: "email_capture",
    type: "input",
    inputType: "email",
    question: "Digite seu e-mail para receber seu plano personalizado",
    placeholder: "seu@email.com",
    note: "Prometemos: nada de spam.",
  },

  {
    id: "name_capture",
    type: "input",
    inputType: "text",
    question: "Qual é o seu nome?",
    placeholder: "Seu nome",
  },
];

export default function Quiz() {
  const [stepIndex, setStepIndex] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createLead = useCreateLead();

  const currentStep = steps[stepIndex];
  const progress = (stepIndex / (steps.length - 1)) * 100;

  useEffect(() => {
    if (!answers.goal && stepIndex > 0) {
      setStepIndex(0);
    }
  }, []);

  const handleAnswer = (key: string, value: any) => {
    setAnswers((prev: QuizAnswers) => ({ ...prev, [key]: value }));

    if (currentStep.type === "single" || currentStep.type === "likert") {
      setTimeout(() => {
        handleContinue();
      }, 300);
    }
  };

  const handleContinue = async () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      try {
        const email = answers.email_capture;
        const name = answers.name_capture;

        await createLead.mutateAsync({
          email,
          name,
          quizData: answers,
        });

        localStorage.setItem("quickhabit_answers", JSON.stringify(answers));
        localStorage.setItem("quickhabit_name", name);

        setLocation("/processing");
      } catch (error) {
        toast({
          title: "Erro",
          description:
            "Algo deu errado ao salvar seu progresso. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    if (stepIndex > 1) {
      setStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (stepIndex === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-700">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase tracking-widest">
                <Zap className="w-4 h-4" />
                Avaliação de 1 min
              </div>

              <h1 className="text-5xl md:text-7xl font-heading font-black text-foreground tracking-tight leading-[1.1]">
                QUICK<span className="text-primary">HABIT</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
                Aprenda novas habilidades em apenas 5 minutos por dia. Descubra
                agora se voce tem potencial para dominar qualquer habilidade em
                4 semanas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => {
                  handleAnswer("goal", "Life");
                  setStepIndex(1);
                }}
                className="group relative px-8 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                data-testid="button-start-career"
              >
                <Laptop className="w-6 h-6" />
                Quero descobrir meu perfil
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Método XP5™</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Leva 1 minuto</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Brain className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Base científica</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isStepValid = () => {
    const val = answers[currentStep.id!];
    if (currentStep.type === "multi")
      return Array.isArray(val) && val.length > 0;
    if (currentStep.type === "input") return val && val.length > 2;
    if (["info", "summary", "timeline"].includes(currentStep.type)) return true;
    return val !== undefined && val !== null;
  };

  return (
    <Layout progress={progress} showBack={stepIndex > 1} onBack={handleBack}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id || stepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl mx-auto"
        >
          {currentStep.type === "single" && (
            <div className="space-y-6">
              <QuestionHeader title={currentStep.question!} />
              <div className="grid gap-3">
                {currentStep.options?.map((opt) => (
                  <OptionCard
                    key={opt}
                    label={opt}
                    selected={answers[currentStep.id!] === opt}
                    onClick={() => handleAnswer(currentStep.id!, opt)}
                  />
                ))}
              </div>
            </div>
          )}

          {currentStep.type === "multi" && (
            <div className="space-y-6">
              <QuestionHeader
                title={currentStep.question!}
                subtitle="Selecione todas que se aplicam"
              />
              <div className="grid gap-3">
                {currentStep.options?.map((opt) => {
                  const current = (answers[currentStep.id!] as string[]) || [];
                  const isSelected = current.includes(opt);
                  return (
                    <OptionCard
                      key={opt}
                      label={opt}
                      selected={isSelected}
                      isMulti
                      onClick={() => {
                        if (isSelected) {
                          handleAnswer(
                            currentStep.id!,
                            current.filter((i) => i !== opt),
                          );
                        } else {
                          handleAnswer(currentStep.id!, [...current, opt]);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {currentStep.type === "likert" && (
            <div className="space-y-8">
              <QuestionHeader
                title={currentStep.statement!}
                subtitle={currentStep.sub}
              />
              <div className="py-8">
                <LikertScale
                  value={answers[currentStep.id!] as number}
                  onChange={(val) => handleAnswer(currentStep.id!, val)}
                />
              </div>
            </div>
          )}

          {currentStep.type === "info" && (
            <div className="text-center space-y-8 py-8">
              {currentStep.visual === "image" ? (
                <OptimizedImage
                  src={currentStep.image as string}
                  alt={currentStep.title}
                  className="w-full max-w-[280px] mx-auto aspect-square"
                />
              ) : (
                currentStep.icon
              )}
              <h1 className="text-3xl font-heading font-bold">
                {currentStep.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {currentStep.text}
              </p>
            </div>
          )}

          {currentStep.type === "summary" && (
            <div className="space-y-6">
              <QuestionHeader title={currentStep.title!} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">
                      Agora
                    </div>
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <div className="text-4xl">
                        <svg viewBox="0 0 48 48" className="w-12 h-12">
                          <circle cx="24" cy="14" r="8" fill="#9ca3af" />
                          <ellipse
                            cx="24"
                            cy="38"
                            rx="12"
                            ry="10"
                            fill="#9ca3af"
                          />
                          <path
                            d="M20 12 Q18 8 20 6"
                            stroke="#9ca3af"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 text-primary">
                    <ChevronRight className="w-5 h-5" />
                    <ChevronRight className="w-5 h-5 -ml-3" />
                    <ChevronRight className="w-5 h-5 -ml-3" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-primary mb-2 font-medium">
                      Meta
                    </div>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="text-4xl">
                        <svg viewBox="0 0 48 48" className="w-12 h-12">
                          <circle
                            cx="24"
                            cy="14"
                            r="8"
                            fill="hsl(var(--primary))"
                          />
                          <ellipse
                            cx="24"
                            cy="38"
                            rx="12"
                            ry="10"
                            fill="hsl(var(--primary))"
                          />
                          <circle cx="22" cy="12" r="1.5" fill="white" />
                          <circle cx="26" cy="12" r="1.5" fill="white" />
                          <path
                            d="M20 16 Q24 20 28 16"
                            stroke="white"
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="bg-card rounded-2xl p-6 space-y-6 border border-border shadow-sm">
                <ProgressBar
                  value={30}
                  label="Bateria de Aprendizado"
                  status="Baixa"
                  statusColor="orange"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <StatCard
                    label="Principal Bloqueio"
                    value="Foco Inconsistente"
                    icon={<Target className="w-5 h-5" />}
                    color="orange"
                  />
                  <StatCard
                    label="Trilha de Habilidade"
                    value={answers.skill_interest || "Crescimento Geral"}
                    icon={<Sparkles className="w-5 h-5" />}
                    color="purple"
                  />
                  <StatCard
                    label="Melhor Formato"
                    value="Micro-licoes"
                    icon={<Timer className="w-5 h-5" />}
                    color="primary"
                  />
                  <StatCard
                    label="Compromisso Diario"
                    value={answers.dedicated_time || "5 min"}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="green"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep.type === "timeline" && (
            <div className="space-y-6">
              <QuestionHeader title={currentStep.title!} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 border border-border shadow-lg mb-6 h-[280px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: "Agora", value: 20, label: "Início" },
                      { name: "Sem 1", value: 40, label: "Base" },
                      { name: "Sem 2", value: 65, label: "Construção" },
                      { name: "Sem 3", value: 85, label: "Momentum" },
                      { name: "Sem 4", value: 100, label: "Domínio" },
                    ]}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorProgress"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#22c55e"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#22c55e"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                      <linearGradient
                        id="strokeGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="35%" stopColor="#f97316" />
                        <stop offset="65%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                      dy={10}
                    />
                    <YAxis hide domain={[0, 110]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 10px 25px -3px rgb(0 0 0 / 0.15)",
                        backgroundColor: "hsl(var(--card))",
                        padding: "12px 16px",
                      }}
                      labelStyle={{
                        fontWeight: 600,
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: number) => [`${value}%`, "Progresso"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="url(#strokeGradient)"
                      strokeWidth={4}
                      fillOpacity={0.15}
                      fill="url(#strokeGradient)"
                      animationDuration={1500}
                      dot={{
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        r: 5,
                        stroke: "white",
                      }}
                      activeDot={{
                        r: 7,
                        stroke: "hsl(var(--primary))",
                        strokeWidth: 3,
                        fill: "white",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 border border-border shadow-lg"
              >
                <div className="space-y-6 relative">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="absolute left-[19px] top-6 bottom-6 w-1 bg-gradient-to-b from-red-500 via-orange-400 via-yellow-400 to-green-500 rounded-full origin-top"
                  />

                  {[
                    {
                      week: "Semana 1",
                      text: "Parar de quebrar promessas",
                      color: "red" as const,
                    },
                    {
                      week: "Semana 2",
                      text: "Construir o loop do hábito",
                      color: "orange" as const,
                    },
                    {
                      week: "Semana 3",
                      text: "Fase de momentum",
                      color: "yellow" as const,
                    },
                    {
                      week: "Semana 4",
                      text: "Crescimento Consistente",
                      color: "green" as const,
                    },
                  ].map((item, idx) => (
                    <TimelineItem
                      key={idx}
                      week={item.week}
                      text={item.text}
                      color={item.color}
                      index={idx}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {currentStep.type === "input" && (
            <div className="space-y-6">
              <QuestionHeader
                title={currentStep.question!}
                subtitle={currentStep.note}
              />
              <input
                type={currentStep.inputType}
                placeholder={currentStep.placeholder}
                value={answers[currentStep.id!] || ""}
                onChange={(e) => handleAnswer(currentStep.id!, e.target.value)}
                className="w-full text-lg p-4 rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                autoFocus
                data-testid={`input-${currentStep.id}`}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <BottomBar
        onContinue={handleContinue}
        disabled={!isStepValid()}
        loading={createLead.isPending}
        label={stepIndex === steps.length - 1 ? "Gerar Plano" : "Continuar"}
        className={
          ["single", "likert"].includes(currentStep.type) ? "hidden" : ""
        }
      />
    </Layout>
  );
}
