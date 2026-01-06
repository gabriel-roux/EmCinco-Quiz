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

// Import generated images
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

// Types for Quiz Data
interface QuizAnswers {
  [key: string]: any;
}

const steps: QuizStep[] = [
  // 0: Landing (Handled separately but index 0 for flow)
  { type: "landing" }, 
  
  // 1: Age
  { 
    id: "age",
    type: "single", 
    question: "What’s your age?", 
    options: ["18–24", "25–34", "35–44", "45–54", "55+"] 
  },
  
  // 2: Hook
  { 
    id: "struggle",
    type: "single", 
    question: "Be honest: what usually happens when you try to learn something new?", 
    options: [
      "I start strong… then disappear",
      "I overthink and never start",
      "I start but I get distracted",
      "I’m consistent, but slow",
      "I don’t even know what to learn"
    ]
  },
  
  // 3: Likert - Potential
  { 
    id: "consistency_likert",
    type: "likert", 
    statement: "I have the potential — I just can't stay consistent.",
    sub: "Do you agree with the statement above?"
  },
  
  // 4: Focus
  {
    id: "focus_struggle",
    type: "single",
    question: "Do you struggle to focus even on easy tasks?",
    options: ["Almost always", "Often", "Rarely", "Almost never"]
  },
  
  // 5: Mental Fog
  {
    id: "mental_fog",
    type: "single",
    question: "Do you feel mentally “foggy” during the day?",
    options: ["Almost always", "Often", "Rarely", "Almost never"]
  },
  
  // 6: Decision Fatigue
  {
    id: "decision_fatigue",
    type: "single",
    question: "Do you feel stuck choosing what to learn first?",
    options: ["Almost always", "Often", "Rarely", "Almost never"]
  },
  
  // 7: Likert - Autopilot
  {
    id: "autopilot_likert",
    type: "likert",
    statement: "I feel like my days run on autopilot.",
    sub: "Do you agree?"
  },
  
  // 8: Typical Day
  {
    id: "typical_day",
    type: "single",
    question: "How would you describe your typical day?",
    options: [
      "Always busy / always rushing",
      "Busy but manageable",
      "Calm but unfocused",
      "Chaotic and unpredictable"
    ]
  },
  
  // 9: Screen Time
  {
    id: "screen_distraction",
    type: "single",
    question: "How often does your phone steal your attention?",
    options: ["All the time", "Often", "Sometimes", "Rarely"]
  },
  
  // 10: Learning Time
  {
    id: "dedicated_time",
    type: "single",
    question: "How much time can you реально dedicate per day?",
    options: ["2 min", "5 min (recommended)", "10 min", "15 min"]
  },
  
  // 11: Eating/Routine
  {
    id: "routine_chaos",
    type: "single",
    question: "Have your routines been chaotic lately?",
    options: ["Yes a lot", "A little", "Not really", "No I'm structured"]
  },
  
  // 12: Motivation Pain (Multi)
  {
    id: "fix_priority",
    type: "multi",
    question: "What do you want to fix first?",
    options: ["Discipline", "Focus", "Confidence", "Consistency", "Money/Career", "Creativity", "Anxiety", "Energy"]
  },
  
  // 13: Story (Info)
  {
    id: "story_1",
    type: "info",
    title: "Your problem isn't laziness.",
    text: "If learning feels hard, it's usually because your \"daily system\" is broken — distracted attention, unclear goals, and zero feedback. QUICKHABIT rebuilds that system in 5 minutes a day.",
    visual: "image",
    image: batteryLowImg
  },
  
  // 14: Life Impact (Multi)
  {
    id: "suffering_area",
    type: "multi",
    question: "What suffers the most when you don't learn?",
    options: ["Work", "Confidence", "Money", "Relationships", "Mental health", "Creativity", "Motivation"]
  },
  
  // 15: Skill Type
  {
    id: "skill_interest",
    type: "single",
    question: "What kind of skills excite you most?",
    options: ["Tech/AI", "Communication", "Business", "Creative", "Mind & Body", "Languages"]
  },
  
  // 16: Learning Style
  {
    id: "learning_style",
    type: "single",
    question: "How do you learn best?",
    options: ["Micro-lessons", "Step-by-step", "Reading", "Practice", "Mix"]
  },
  
  // 17: Quit Habits (Multi)
  {
    id: "bad_habits",
    type: "multi",
    question: "Which habits are holding you back?",
    options: ["Late nights", "Screen time", "Scrolling", "Skipping workouts", "Sugar", "Procrastination", "Overthinking", "None"]
  },
  
  // 18: Authority (Info)
  {
    id: "authority_info",
    type: "info",
    title: "Built on behavioral science.",
    text: "Your plan uses proven principles: habit stacking, friction design, and micro-commitments.",
    visual: "image",
    image: researchImg
  },
  
  // 19: Experience
  {
    id: "app_experience",
    type: "single",
    question: "Have you tried habit apps before?",
    options: ["Yes but quit", "Yes still use", "No, I'm a pro"]
  },
  
  // 20: Expert Review (Info)
  {
    id: "expert_review",
    type: "info",
    title: "Your plan is generated by an adaptive engine.",
    text: "It chooses a skill track and a daily mission based on your answers — then adjusts as you improve.",
    visual: "image",
    image: engineImg
  },
  
  // 21: Improvements (Multi)
  {
    id: "outcome_desire",
    type: "multi",
    question: "How will your life improve if you fix this?",
    options: ["Better performance", "More money", "Confidence", "Focus", "Less anxiety", "Creativity", "Discipline"]
  },
  
  // 22: Profile Summary (Info/Result Preview)
  {
    id: "profile_summary",
    type: "summary",
    title: "Summary of your Profile",
    image: profileImg
  },
  
  // 23: Commitment
  {
    id: "commitment_time",
    type: "single",
    question: "How much time can you dedicate daily to your QUICKHABIT plan?",
    options: ["5 min", "10 min", "15 min", "20 min"]
  },
  
  // 24: Plan Timeline (Info/Graph)
  {
    id: "timeline_view",
    type: "timeline",
    title: "The last learning plan you'll ever need",
    image: growthImg
  },
  
  // 25: Email Capture
  {
    id: "email_capture",
    type: "input",
    inputType: "email",
    question: "Enter your email to get your personalized QUICKHABIT Plan",
    placeholder: "name@example.com",
    note: "We respect your privacy. No spam."
  },
  
  // 26: Name Capture (Submit)
  {
    id: "name_capture",
    type: "input",
    inputType: "text",
    question: "What's your name?",
    placeholder: "Your Name"
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
    // If no goal selected, redirect to landing
    if (!answers.goal && stepIndex > 0) {
      setStepIndex(0);
    }
  }, []);

  const handleAnswer = (key: string, value: any) => {
    setAnswers((prev: QuizAnswers) => ({ ...prev, [key]: value }));
    
    // Auto-advance for single choice and likert questions
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
      // Final step submission
      try {
        const email = answers.email_capture;
        const name = answers.name_capture;
        
        await createLead.mutateAsync({
          email,
          name,
          quizData: answers,
        });
        
        // Pass collected data via localStorage to avoid URL params limits
        localStorage.setItem("quickhabit_answers", JSON.stringify(answers));
        localStorage.setItem("quickhabit_name", name);
        
        setLocation("/processing");
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong saving your progress. Please try again.",
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

  // Render Landing (Step 0)
  if (stepIndex === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-700">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase tracking-widest">
                <Zap className="w-4 h-4" />
                Free 1-min Assessment
              </div>
              
              <h1 className="text-5xl md:text-7xl font-heading font-black text-foreground tracking-tight leading-[1.1]">
                QUICK<span className="text-primary">HABIT</span>
              </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              Discover your learning blockers and get a personalized 4-week plan in just 5 minutes a day.
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
                I want to grow my Career
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
                I want to improve my Life
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Takes 1 minute</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>Science-backed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper to check if current step is completed
  const isStepValid = () => {
    const val = answers[currentStep.id!];
    if (currentStep.type === "multi") return Array.isArray(val) && val.length > 0;
    if (currentStep.type === "input") return val && val.length > 2; // Basic validation
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
          {/* CONTENT RENDERER */}
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
                subtitle="Select all that apply" 
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
                  className="w-full max-w-[280px] mx-auto aspect-square rounded-2xl shadow-lg"
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
                  alt="Profile summary"
                  className="w-full max-w-[280px] mx-auto aspect-square rounded-2xl shadow-lg mb-6"
                />
              )}
              
              <div className="bg-card rounded-2xl p-6 space-y-6 border border-border shadow-sm">
                <ProgressBar 
                  value={30} 
                  label="Learning Battery" 
                  status="Low" 
                  statusColor="orange" 
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <StatCard 
                    label="Main Blocker" 
                    value="Inconsistent Focus" 
                    icon={<Target className="w-5 h-5" />}
                    color="orange"
                  />
                  <StatCard 
                    label="Skill Track" 
                    value={answers.skill_interest || "General Growth"} 
                    icon={<Sparkles className="w-5 h-5" />}
                    color="purple"
                  />
                  <StatCard 
                    label="Best Format" 
                    value="Micro-lessons" 
                    icon={<Timer className="w-5 h-5" />}
                    color="primary"
                  />
                  <StatCard 
                    label="Daily Commitment" 
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
                      { name: "Now", value: 20, label: "Starting" },
                      { name: "Week 1", value: 40, label: "Foundation" },
                      { name: "Week 2", value: 65, label: "Building" },
                      { name: "Week 3", value: 85, label: "Momentum" },
                      { name: "Week 4", value: 100, label: "Mastery" },
                    ]}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#22c55e" />
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
                      formatter={(value: number) => [`${value}%`, 'Progress']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="url(#strokeGradient)" 
                      strokeWidth={4}
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
                    className="absolute left-[19px] top-6 bottom-6 w-1 bg-gradient-to-b from-red-400 via-orange-400 via-yellow-400 to-green-500 rounded-full origin-top" 
                  />
                  
                  {[
                    { week: "Week 1", text: "Stop breaking promises", color: "red" as const },
                    { week: "Week 2", text: "Build the habit loop", color: "orange" as const },
                    { week: "Week 3", text: "Momentum phase", color: "yellow" as const },
                    { week: "Week 4", text: "Consistent Growth", color: "green" as const }
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
              />
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <BottomBar 
        onContinue={handleContinue} 
        disabled={!isStepValid()} 
        loading={createLead.isPending}
        label={stepIndex === steps.length - 1 ? "Generate Plan" : "Continue"}
        className={["single", "likert"].includes(currentStep.type) ? "hidden" : ""}
      />
    </Layout>
  );
}
