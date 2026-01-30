import { useState, useEffect, useMemo, useRef } from "react";
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
  DiagnosisStep,
  InfoTitle,
  TransitionScreen,
} from "@/components/QuizComponents";
import {
  Target,
  Sparkles,
  Timer,
  TrendingUp,
  ChevronRight,
  Check,
  Clock,
  Zap,
  MessageSquare,
  CheckCircle,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/i18n";
import { getQuizSteps, landingContent, type QuizStep } from "@/data/quizSteps";
import QuizExitPopup from "@/components/QuizExitPopup";

const imageMap: Record<string, string> = {
  batteryLow: "/images/battery-low.webp",
  research: "/images/research.webp",
  engine: "/images/engine.webp",
  profile: "/images/profile.webp",
  growth: "/images/growth.webp",
  cartoonLearning: "/images/cartoon-learning.webp",
};

const avatars = [
  "/images/avatar1.webp",
  "/images/avatar2.webp",
  "/images/avatar3.webp",
  "/images/avatar4.webp",
  "/images/avatar5.webp",
  "/images/avatar6.webp",
];

interface QuizAnswers {
  [key: string]: any;
}

// Classifica o perfil do usuário baseado nas respostas do quiz
// Usa padrões que funcionam em ambos idiomas (pt-BR e es)
function getCheckoutProfile(answers: QuizAnswers): "emocional" | "racional" {
  let score = 0;

  // Verifica respostas que indicam sobrecarga emocional (likert 4-5)
  if (answers.consistency_likert >= 4) score++;
  if (answers.focus_likert >= 4) score++;
  if (answers.autopilot_likert >= 4) score++;

  // routine_chaos: primeira opção indica estagnação em ambos idiomas
  // pt-BR: "Me sinto estagnado e sem direcao" / es: "Me siento estancado y sin direccion"
  const routineChaosValue = answers.routine_chaos || "";
  if (
    routineChaosValue.toLowerCase().includes("estagnado") ||
    routineChaosValue.toLowerCase().includes("estancado")
  )
    score++;

  // focus_blockers: última opção indica esgotamento em ambos idiomas
  // pt-BR: "Chego mentalmente esgotado..." / es: "Llego mentalmente agotado..."
  const focusBlockersValue = answers.focus_blockers || "";
  if (
    focusBlockersValue.toLowerCase().includes("esgotado") ||
    focusBlockersValue.toLowerCase().includes("agotado")
  )
    score++;

  return score >= 3 ? "emocional" : "racional";
}

export default function Quiz() {
  const [stepIndex, setStepIndex] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createLead = useCreateLead();
  const { locale } = useLocale();
  const hasShownExitPopupRef = useRef(false);
  const stepIndexRef = useRef(stepIndex);

  const steps = useMemo(() => getQuizSteps(locale), [locale]);
  const landing = landingContent[locale];

  // Random headline selection (stable per session)
  const headlineIndex = useMemo(() => Math.floor(Math.random() * 3), []);
  const selectedHeadline = landing.headlines?.[headlineIndex] || {
    title: landing.welcomeTitle1 + " " + landing.welcomeHighlight,
    subtitle: landing.subtitle,
  };

  // Random live count (28-47 pessoas)
  const liveCount = useMemo(() => Math.floor(Math.random() * 20) + 28, []);

  const currentStep = steps[stepIndex];
  const progress = (stepIndex / (steps.length - 1)) * 100;

  const getImage = (img: string | undefined): string => {
    if (!img) return "";
    return imageMap[img] || img;
  };

  useEffect(() => {
    if (!answers.goal && stepIndex > 0) {
      setStepIndex(0);
    }
  }, []);

  // Keep stepIndexRef in sync
  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  // Exit intent detection for quiz (only after user has started)
  useEffect(() => {
    // Track if user has left the page (for mobile visibility change)
    let hasLeftPage = false;
    
    // Add initial history entry when component mounts
    window.history.pushState(
      { page: "quiz", step: 0 },
      "",
      window.location.href,
    );

    const handlePopState = (e: PopStateEvent) => {
      // Re-push state to stay on quiz
      window.history.pushState({ page: "quiz" }, "", window.location.href);

      // Show popup if not already shown and user has started quiz
      if (!hasShownExitPopupRef.current && stepIndexRef.current > 1) {
        hasShownExitPopupRef.current = true;
        setShowExitPopup(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 &&
        !hasShownExitPopupRef.current &&
        stepIndexRef.current > 1
      ) {
        hasShownExitPopupRef.current = true;
        setShowExitPopup(true);
      }
    };
    
    // Mobile: detect when user leaves app/browser and returns
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User left the page (switched app, minimized, etc)
        if (stepIndexRef.current > 1) {
          hasLeftPage = true;
        }
      } else if (document.visibilityState === "visible" && hasLeftPage) {
        // User came back - show popup if not already shown
        hasLeftPage = false;
        if (!hasShownExitPopupRef.current && stepIndexRef.current > 1) {
          hasShownExitPopupRef.current = true;
          setShowExitPopup(true);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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

        localStorage.setItem("emcinco_answers", JSON.stringify(answers));
        localStorage.setItem("emcinco_name", name);

        // Classificar perfil do usuário (emocional vs racional)
        const checkoutProfile = getCheckoutProfile(answers);
        localStorage.setItem("emcinco_checkout_profile", checkoutProfile);

        setLocation("/processing");
      } catch (error) {
        toast({
          title: landing.error,
          description: landing.errorSaving,
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
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
      },
    };

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md mx-auto w-full text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <Zap className="w-3.5 h-3.5" />
                {landing.badge}
              </span>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <img src="/images/logo.webp" alt="EmCinco" width={150} height={50} className="h-14 mx-auto" />
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-base mb-8 leading-relaxed max-w-sm mx-auto"
            >
              {landing.subtitle}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex items-stretch justify-center gap-3 mb-8"
            >
              <div className="flex-1 bg-primary/5 rounded-2xl px-4 py-3 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">
                  {landing.socialProofLabel}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex -space-x-2">
                    <img
                      src={avatars[0]}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full border-2 border-background object-cover"
                    />
                    <img
                      src={avatars[1]}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full border-2 border-background object-cover"
                    />
                    <img
                      src={avatars[2]}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full border-2 border-background object-cover"
                    />
                  </div>
                  <span className="text-sm font-bold">+847</span>
                </div>
              </div>
              <div className="flex-1 bg-primary/5 rounded-2xl px-4 py-3 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">
                  {landing.discoveringNow}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex -space-x-2">
                    <img
                      src={avatars[3]}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full border-2 border-background object-cover"
                    />
                    <img
                      src={avatars[4]}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full border-2 border-background object-cover"
                    />
                    <img
                      src={avatars[5]}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full border-2 border-background object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-sm font-bold">{liveCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8">
              <button
                className="relative w-full py-5 text-base font-semibold gap-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors flex items-center justify-center overflow-hidden"
                onClick={() => {
                  handleAnswer("goal", "Life");
                  setStepIndex(1);
                }}
                data-testid="button-start-quiz"
              >
                <span className="absolute inset-0 rounded-2xl animate-pulse bg-white/10"></span>
                <MessageSquare className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{landing.ctaDiscover}</span>
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{landing.feature1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>{landing.feature2}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>{landing.feature3}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isStepValid = () => {
    if (currentStep.type === "diagnosis") return true;
    const val = answers[currentStep.id!];
    if (currentStep.type === "multi")
      return Array.isArray(val) && val.length > 0;
    if (currentStep.type === "input") {
      if (currentStep.id === "whatsapp_capture") return true;
      return val && val.length > 2;
    }
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
          {currentStep.type === "diagnosis" && (
            <DiagnosisStep onContinue={handleContinue} />
          )}

          {currentStep.type === "single" && (
            <div className="space-y-6">
              <QuestionHeader
                title={currentStep.question!}
                highlight={currentStep.highlight}
                micro={currentStep.micro}
              />
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
                subtitle={landing.selectAll}
                highlight={currentStep.highlight}
                micro={currentStep.micro}
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
                highlight={currentStep.highlight}
                micro={currentStep.micro}
              />
              <div className="py-8">
                <LikertScale
                  value={answers[currentStep.id!] as number}
                  onChange={(val) => handleAnswer(currentStep.id!, val)}
                  labels={{ min: landing.disagree, max: landing.agree }}
                />
              </div>
            </div>
          )}

          {currentStep.type === "info" && (
            <div className="text-center space-y-8 py-8 overflow-hidden">
              {currentStep.visual === "image" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <OptimizedImage
                    src={getImage(currentStep.image)}
                    alt={currentStep.title}
                    className="w-full max-w-[280px] mx-auto aspect-square"
                  />
                </motion.div>
              ) : (
                currentStep.icon
              )}
              <InfoTitle
                title={currentStep.title!}
                highlight={currentStep.highlight}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="text-xl text-muted-foreground leading-relaxed"
              >
                {currentStep.text}
              </motion.p>
            </div>
          )}

          {currentStep.type === "transition" && (
            <TransitionScreen
              badge={(currentStep as any).badge}
              title={currentStep.title!}
              highlights={(currentStep as any).highlights}
              text={currentStep.text!}
            />
          )}

          {currentStep.type === "summary" && (
            <div className="space-y-6">
              <QuestionHeader
                title={currentStep.title!}
                highlight={currentStep.highlight}
                micro={currentStep.micro}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">
                      {landing.now}
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
                      {landing.goal}
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
                  label={landing.learningBattery}
                  status={landing.low}
                  statusColor="orange"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <StatCard
                    label={landing.mainBlocker}
                    value={landing.inconsistentFocus}
                    icon={<Target className="w-5 h-5" />}
                    color="orange"
                  />
                  <StatCard
                    label={landing.skillTrack}
                    value={answers.skill_interest || landing.generalGrowth}
                    icon={<Sparkles className="w-5 h-5" />}
                    color="purple"
                  />
                  <StatCard
                    label={landing.bestFormat}
                    value={landing.microLessons}
                    icon={<Timer className="w-5 h-5" />}
                    color="primary"
                  />
                  <StatCard
                    label={landing.dailyCommitment}
                    value={answers.dedicated_time || landing.fiveMin}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="green"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep.type === "benefits" && (
            <div className="space-y-6">
              <QuestionHeader
                title={currentStep.title!}
                highlight={currentStep.highlight}
                micro={currentStep.micro}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl p-6 border border-green-500/20 shadow-sm"
              >
                <div className="space-y-4">
                  {currentStep.benefits?.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-base text-foreground font-medium">
                        {benefit}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Button
                  onClick={handleContinue}
                  className="w-full max-w-xs mx-auto bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg"
                  data-testid="button-benefits-continue"
                >
                  {landing.continue}
                </Button>
              </motion.div>
            </div>
          )}

          {currentStep.type === "timeline" && (
            <div className="space-y-6">
              <QuestionHeader
                title={currentStep.title!}
                highlight={currentStep.highlight}
                micro={currentStep.micro}
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 border border-border shadow-lg mb-6 h-[280px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: landing.now, value: 20, label: landing.start },
                      { name: landing.week1, value: 40, label: landing.base },
                      {
                        name: landing.week2,
                        value: 65,
                        label: landing.building,
                      },
                      {
                        name: landing.week3,
                        value: 85,
                        label: landing.momentum,
                      },
                      {
                        name: landing.week4,
                        value: 100,
                        label: landing.mastery,
                      },
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
                      week: landing.week1Title,
                      text: landing.week1Text,
                      color: "red" as const,
                    },
                    {
                      week: landing.week2Title,
                      text: landing.week2Text,
                      color: "orange" as const,
                    },
                    {
                      week: landing.week3Title,
                      text: landing.week3Text,
                      color: "yellow" as const,
                    },
                    {
                      week: landing.week4Title,
                      text: landing.week4Text,
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
                highlight={currentStep.highlight}
                micro={currentStep.micro}
              />
              <input
                type={currentStep.inputType}
                placeholder={currentStep.placeholder}
                value={answers[currentStep.id!] || ""}
                onChange={(e) => {
                  if (currentStep.id === "whatsapp_capture") {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 11) {
                      if (value.length > 2) {
                        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                      }
                      if (value.length > 10) {
                        value = `${value.slice(0, 10)}-${value.slice(10)}`;
                      }
                    }
                    handleAnswer(currentStep.id!, value);
                  } else {
                    handleAnswer(currentStep.id!, e.target.value);
                  }
                }}
                className="w-full text-lg p-4 rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                autoFocus
                data-testid={`input-${currentStep.id}`}
              />
              {currentStep.id === "whatsapp_capture" && (
                <button
                  onClick={handleContinue}
                  className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
                  data-testid="button-skip-whatsapp"
                >
                  {landing.skipStep}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <BottomBar
        onContinue={handleContinue}
        disabled={!isStepValid()}
        loading={createLead.isPending}
        label={
          stepIndex === steps.length - 1
            ? landing.generatePlan
            : landing.continue
        }
        className={
          ["single", "likert"].includes(currentStep.type) &&
          currentStep.type !== "diagnosis"
            ? "hidden"
            : ""
        }
      />

      <QuizExitPopup
        isOpen={showExitPopup}
        onClose={() => (window.location.href = "/result-back-offer")}
        onContinue={() => setShowExitPopup(false)}
        progress={progress}
      />
    </Layout>
  );
}
