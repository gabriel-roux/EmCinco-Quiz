import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { Layout } from "@/components/Layout";
import { OptionCard, LikertScale, BottomBar, QuestionHeader, OptimizedImage, StatCard, ProgressBar, TimelineItem } from "@/components/QuizComponents";
import { Target, Sparkles, Timer, TrendingUp } from "lucide-react";
import { 
  Laptop, Heart, Clock, Battery, Brain, 
  Smartphone, Coffee, AlertTriangle, CheckCircle, Zap
} from "lucide-react";
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
    question: "Qual a sua idade?", 
    options: ["18-24", "25-34", "35-44", "45-54", "55+"] 
  },
  
  { 
    id: "struggle",
    type: "single", 
    question: "Seja honesto: o que geralmente acontece quando voce tenta aprender algo novo?", 
    options: [
      "Comeco forte... depois sumo",
      "Penso demais e nunca comeco",
      "Comeco mas me distraio",
      "Sou consistente, mas lento",
      "Nem sei o que aprender"
    ]
  },
  
  { 
    id: "consistency_likert",
    type: "likert", 
    statement: "Eu tenho potencial - so nao consigo manter a consistencia.",
    sub: "Voce concorda com essa afirmacao?"
  },
  
  {
    id: "focus_struggle",
    type: "single",
    question: "Voce tem dificuldade em focar mesmo em tarefas faceis?",
    options: ["Quase sempre", "Frequentemente", "Raramente", "Quase nunca"]
  },
  
  {
    id: "mental_fog",
    type: "single",
    question: "Voce se sente mentalmente 'enevoado' durante o dia?",
    options: ["Quase sempre", "Frequentemente", "Raramente", "Quase nunca"]
  },
  
  {
    id: "decision_fatigue",
    type: "single",
    question: "Voce se sente travado escolhendo o que aprender primeiro?",
    options: ["Quase sempre", "Frequentemente", "Raramente", "Quase nunca"]
  },
  
  {
    id: "autopilot_likert",
    type: "likert",
    statement: "Sinto que meus dias funcionam no piloto automatico.",
    sub: "Voce concorda?"
  },
  
  {
    id: "typical_day",
    type: "single",
    question: "Como voce descreveria seu dia tipico?",
    options: [
      "Sempre ocupado / sempre correndo",
      "Ocupado mas administravel",
      "Calmo mas sem foco",
      "Caotico e imprevisivel"
    ]
  },
  
  {
    id: "screen_distraction",
    type: "single",
    question: "Com que frequencia seu celular rouba sua atencao?",
    options: ["O tempo todo", "Frequentemente", "As vezes", "Raramente"]
  },
  
  {
    id: "dedicated_time",
    type: "single",
    question: "Quanto tempo voce pode dedicar por dia de verdade?",
    options: ["2 min", "5 min (recomendado)", "10 min", "15 min"]
  },
  
  {
    id: "routine_chaos",
    type: "single",
    question: "Suas rotinas estao caoticas ultimamente?",
    options: ["Sim, muito", "Um pouco", "Nao muito", "Nao, sou organizado"]
  },
  
  {
    id: "fix_priority",
    type: "multi",
    question: "O que voce quer melhorar primeiro?",
    options: ["Disciplina", "Foco", "Confianca", "Consistencia", "Dinheiro/Carreira", "Criatividade", "Ansiedade", "Energia"]
  },
  
  {
    id: "story_1",
    type: "info",
    title: "Seu problema nao e preguica.",
    text: "Se aprender parece dificil, geralmente e porque seu 'sistema diario' esta quebrado - atencao distraida, metas confusas e zero feedback. O QUICKHABIT reconstroi esse sistema em 5 minutos por dia.",
    visual: "image",
    image: batteryLowImg
  },
  
  {
    id: "suffering_area",
    type: "multi",
    question: "O que mais sofre quando voce nao aprende?",
    options: ["Trabalho", "Confianca", "Dinheiro", "Relacionamentos", "Saude mental", "Criatividade", "Motivacao"]
  },
  
  {
    id: "skill_interest",
    type: "single",
    question: "Que tipo de habilidades te animam mais?",
    options: ["Tech/IA", "Comunicacao", "Negocios", "Criativo", "Mente e Corpo", "Idiomas"]
  },
  
  {
    id: "learning_style",
    type: "single",
    question: "Como voce aprende melhor?",
    options: ["Micro-licoes", "Passo a passo", "Leitura", "Pratica", "Mix de tudo"]
  },
  
  {
    id: "bad_habits",
    type: "multi",
    question: "Quais habitos estao te atrapalhando?",
    options: ["Dormir tarde", "Tempo de tela", "Scrollar redes", "Pular treinos", "Acucar", "Procrastinacao", "Pensar demais", "Nenhum"]
  },
  
  {
    id: "authority_info",
    type: "info",
    title: "Baseado em ciencia comportamental.",
    text: "Seu plano usa principios comprovados: empilhamento de habitos, design de friccao e micro-compromissos.",
    visual: "image",
    image: researchImg
  },
  
  {
    id: "app_experience",
    type: "single",
    question: "Voce ja tentou apps de habitos antes?",
    options: ["Sim, mas desisti", "Sim, ainda uso", "Nao, sou um expert"]
  },
  
  {
    id: "expert_review",
    type: "info",
    title: "Seu plano e gerado por um motor adaptativo.",
    text: "Ele escolhe uma trilha de habilidades e uma missao diaria baseada nas suas respostas - e se ajusta conforme voce evolui.",
    visual: "image",
    image: engineImg
  },
  
  {
    id: "outcome_desire",
    type: "multi",
    question: "Como sua vida vai melhorar se voce resolver isso?",
    options: ["Melhor desempenho", "Mais dinheiro", "Confianca", "Foco", "Menos ansiedade", "Criatividade", "Disciplina"]
  },
  
  {
    id: "profile_summary",
    type: "summary",
    title: "Resumo do seu Perfil",
    image: profileImg
  },
  
  {
    id: "commitment_time",
    type: "single",
    question: "Quanto tempo voce pode dedicar diariamente ao seu plano QUICKHABIT?",
    options: ["5 min", "10 min", "15 min", "20 min"]
  },
  
  {
    id: "timeline_view",
    type: "timeline",
    title: "O ultimo plano de aprendizado que voce vai precisar",
    image: growthImg
  },
  
  {
    id: "email_capture",
    type: "input",
    inputType: "email",
    question: "Digite seu email para receber seu Plano QUICKHABIT personalizado",
    placeholder: "seu@email.com",
    note: "Respeitamos sua privacidade. Sem spam."
  },
  
  {
    id: "name_capture",
    type: "input",
    inputType: "text",
    question: "Qual e o seu nome?",
    placeholder: "Seu Nome"
  }
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
      setStepIndex(prev => prev + 1);
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
          description: "Algo deu errado ao salvar seu progresso. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    if (stepIndex > 1) {
      setStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                Avaliacao Gratuita de 1 min
              </div>
              
              <h1 className="text-5xl md:text-7xl font-heading font-black text-foreground tracking-tight leading-[1.1]">
                QUICK<span className="text-primary">HABIT</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
                Descubra seus bloqueios de aprendizado e receba um plano personalizado de 4 semanas em apenas 5 minutos por dia.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => {
                  handleAnswer("goal", "Career");
                  setStepIndex(1);
                }}
                className="group relative px-8 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                data-testid="button-start-career"
              >
                <Laptop className="w-6 h-6" />
                Quero crescer na Carreira
              </button>

              <button
                onClick={() => {
                  handleAnswer("goal", "Life");
                  setStepIndex(1);
                }}
                className="group relative px-8 py-5 bg-white text-foreground border-2 border-border rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                data-testid="button-start-life"
              >
                <Heart className="w-6 h-6 text-rose-500" />
                Quero melhorar minha Vida
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>100% Gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Leva 1 minuto</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>Base cientifica</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isStepValid = () => {
    const val = answers[currentStep.id!];
    if (currentStep.type === "multi") return Array.isArray(val) && val.length > 0;
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
                          handleAnswer(currentStep.id!, current.filter(i => i !== opt));
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
              ) : currentStep.icon}
              <h1 className="text-3xl font-heading font-bold">{currentStep.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {currentStep.text}
              </p>
            </div>
          )}

          {currentStep.type === "summary" && (
            <div className="space-y-6">
              <QuestionHeader title={currentStep.title!} />
              
              {currentStep.image && (
                <OptimizedImage
                  src={currentStep.image as string}
                  alt="Resumo do perfil"
                  className="w-full max-w-[280px] mx-auto aspect-square rounded-2xl shadow-lg mb-6"
                />
              )}
              
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
                      { name: "Agora", value: 20, label: "Inicio" },
                      { name: "Sem 1", value: 40, label: "Base" },
                      { name: "Sem 2", value: 65, label: "Construcao" },
                      { name: "Sem 3", value: 85, label: "Momentum" },
                      { name: "Sem 4", value: 100, label: "Dominio" },
                    ]}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis hide domain={[0, 110]} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid hsl(var(--border))', 
                        boxShadow: '0 10px 25px -3px rgb(0 0 0 / 0.15)',
                        backgroundColor: 'hsl(var(--card))',
                        padding: '12px 16px'
                      }}
                      labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`${value}%`, 'Progresso']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorProgress)" 
                      animationDuration={1500}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5, stroke: 'white' }}
                      activeDot={{ r: 7, stroke: 'hsl(var(--primary))', strokeWidth: 3, fill: 'white' }}
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
                    className="absolute left-[19px] top-6 bottom-6 w-1 bg-primary/30 rounded-full origin-top" 
                  />
                  
                  {[
                    { week: "Semana 1", text: "Parar de quebrar promessas", color: "red" as const },
                    { week: "Semana 2", text: "Construir o loop do habito", color: "orange" as const },
                    { week: "Semana 3", text: "Fase de momentum", color: "yellow" as const },
                    { week: "Semana 4", text: "Crescimento Consistente", color: "green" as const }
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
                className="w-full text-2xl p-6 rounded-2xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
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
        className={["single", "likert"].includes(currentStep.type) ? "hidden" : ""}
      />
    </Layout>
  );
}
