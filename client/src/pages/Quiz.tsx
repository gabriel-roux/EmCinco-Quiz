import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { OptionCard, LikertScale, BottomBar, QuestionHeader } from "@/components/QuizComponents";
import { 
  Laptop, Heart, Clock, Battery, Brain, 
  Smartphone, Coffee, AlertTriangle, CheckCircle 
} from "lucide-react";
import { useCreateLead } from "@/hooks/use-leads";
import { useToast } from "@/hooks/use-toast";

// Import generated images
import batteryLowImg from "@assets/generated_images/flat_minimal_battery_charging_illustration.png";
import researchImg from "@assets/generated_images/flat_minimal_academic_logos_illustration.png";
import engineImg from "@assets/generated_images/flat_minimal_adaptive_engine_illustration.png";
import profileImg from "@assets/generated_images/flat_minimal_comparison_avatars_illustration.png";
import growthImg from "@assets/generated_images/flat_minimal_growth_chart_illustration.png";

// Types for Quiz Data
interface QuizAnswers {
  [key: string]: any;
}

const steps = [
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
    text: "If learning feels hard, it's usually because your \"daily system\" is broken — distracted attention, unclear goals, and zero feedback. The SkillSprint Plan rebuilds that system in 5 minutes a day.",
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
    question: "How much time can you dedicate daily to your SkillSprint?",
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
    question: "Enter your email to get your personalized SkillSprint Plan",
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
    setAnswers(prev => ({ ...prev, [key]: value }));
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
        localStorage.setItem("skillSprint_answers", JSON.stringify(answers));
        localStorage.setItem("skillSprint_name", name);
        
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

  // Render Landing (Step 0)
  if (stepIndex === 0) {
    return (
      <Layout hideHeader>
        <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700">
          <div className="space-y-4 max-w-xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase tracking-widest mb-2">
              1-min quiz
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-foreground tracking-tight">
              SkillSprint™ <span className="text-primary">PLAN</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              Find out what’s blocking your learning — and get a 5-minute daily plan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
            <button
              onClick={() => {
                handleAnswer("goal", "Career");
                setStepIndex(1);
              }}
              className="group p-8 bg-white border border-border rounded-2xl shadow-xl shadow-black/5 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 text-left"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Laptop className="w-8 h-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">I want to learn for Career</h3>
              <p className="text-muted-foreground">Grow income, skills, and professional value</p>
            </button>

            <button
              onClick={() => {
                handleAnswer("goal", "Life");
                setStepIndex(1);
              }}
              className="group p-8 bg-white border border-border rounded-2xl shadow-xl shadow-black/5 hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 text-left"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Heart className="w-8 h-8 text-rose-500 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">I want to learn for Life</h3>
              <p className="text-muted-foreground">Hobbies, languages, personal growth, and joy</p>
            </button>
          </div>
        </div>
      </Layout>
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
    <Layout progress={progress}>
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
                <div className="w-full max-w-[280px] mx-auto aspect-square overflow-hidden rounded-2xl">
                  <img 
                    src={currentStep.image as string} 
                    alt={currentStep.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
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
              
              {/* Profile Image */}
              {currentStep.image && (
                <div className="w-full max-w-[280px] mx-auto aspect-square overflow-hidden rounded-2xl mb-6">
                  <img 
                    src={currentStep.image as string} 
                    alt="Profile summary" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Fake Generated Profile */}
              <div className="bg-card rounded-2xl p-6 space-y-6 border border-border">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span>Learning Battery</span>
                    <span className="text-orange-500">Low</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[30%] bg-orange-500 rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Main Blocker</div>
                    <div className="font-semibold text-primary">Inconsistent Focus</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Skill Track</div>
                    <div className="font-semibold text-primary">{answers.skill_interest || "General Growth"}</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Best Format</div>
                    <div className="font-semibold text-primary">Micro-lessons</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Daily Commitment</div>
                    <div className="font-semibold text-primary">{answers.dedicated_time || "5 min"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep.type === "timeline" && (
            <div className="space-y-6">
              <QuestionHeader title={currentStep.title!} />
              
              {/* Timeline Graph Image */}
              {currentStep.image && (
                <div className="w-full max-w-[400px] mx-auto aspect-[4/3] overflow-hidden rounded-2xl mb-6 shadow-sm border border-border">
                  <img 
                    src={currentStep.image as string} 
                    alt="Plan timeline" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                <div className="space-y-8 relative">
                  {/* Simple CSS-based timeline visualization */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-red-400 via-orange-400 to-green-500" />
                  
                  {[
                    { week: "Week 1", text: "Stop breaking promises", color: "text-red-500" },
                    { week: "Week 2", text: "Build the habit loop", color: "text-orange-500" },
                    { week: "Week 3", text: "Momentum phase", color: "text-yellow-600" },
                    { week: "Week 4", text: "Consistent Growth", color: "text-green-600" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full bg-white border-4 ${item.color.replace('text', 'border')} flex-shrink-0`} />
                      <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase">{item.week}</div>
                        <div className={`font-semibold text-lg ${item.color}`}>{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      />
    </Layout>
  );
}
