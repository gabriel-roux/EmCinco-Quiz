import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Check, Star, ShieldCheck, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGeneratePlan } from "@/hooks/use-plan";
import { type PlanResponse } from "@shared/schema";

export default function Result() {
  const [selectedPlan, setSelectedPlan] = useState<"trial" | "month" | "year">("trial");
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const generatePlan = useGeneratePlan();
  
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Fetch plan in background
    const savedAnswers = localStorage.getItem("quickhabit_answers");
    const savedName = localStorage.getItem("quickhabit_name");
    
    if (savedAnswers && savedName && !planData) {
      generatePlan.mutateAsync({
        answers: JSON.parse(savedAnswers),
        name: savedName
      }).then(setPlanData).catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Banner */}
      <div className="sticky top-0 z-50 bg-foreground text-white py-3 px-4 text-center text-sm font-medium shadow-md flex justify-center items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span>Launch bonus reserved for {formatTime(timeLeft)}</span>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-8 md:pt-12 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold uppercase tracking-wider">
            Ready
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold leading-tight">
            Your QUICKHABIT Plan is <span className="text-primary">Ready!</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on your answers, here is your personalized path.
          </p>
        </div>

        {/* Dynamic Plan Preview Card */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-border/50 pb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {planData?.profile.batteryLevel === "Low" ? "⚡" : "🚀"}
            </div>
            <div>
              <div className="text-sm text-muted-foreground uppercase font-semibold">Your Archetype</div>
              <h2 className="text-xl md:text-2xl font-bold font-heading">
                {planData?.profile.type || "Loading..."}
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white p-4 rounded-2xl border border-border">
              <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Daily Mission</div>
              <div className="font-semibold">{planData?.dailyMission || "Loading..."}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-border">
              <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Focus Skill</div>
              <div className="font-semibold">{planData?.profile.skillTrack || "Loading..."}</div>
            </div>
          </div>

          {/* Locked Content Visual */}
          <div className="relative mt-4">
            <div className="space-y-4 blur-sm select-none opacity-50">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-foreground text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                <ShieldCheck className="w-4 h-4" /> Unlock full plan below
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-red-50 border border-red-100">
            <h3 className="font-bold text-red-800 mb-4">Current Path</h3>
            <ul className="space-y-3 text-sm text-red-700">
              <li className="flex gap-2">❌ Inconsistent effort</li>
              <li className="flex gap-2">❌ Mental fog</li>
              <li className="flex gap-2">❌ Decision fatigue</li>
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
            <h3 className="font-bold text-green-800 mb-4">QUICKHABIT Goal</h3>
            <ul className="space-y-3 text-sm text-green-700">
              <li className="flex gap-2"><Check className="w-4 h-4" /> 5-min Habit</li>
              <li className="flex gap-2"><Check className="w-4 h-4" /> Laser Focus</li>
              <li className="flex gap-2"><Check className="w-4 h-4" /> Clear Progress</li>
            </ul>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-center">Choose your plan</h3>
          
          <button
            onClick={() => setSelectedPlan("trial")}
            className={cn(
              "w-full p-6 rounded-2xl border-2 text-left relative transition-all duration-200",
              selectedPlan === "trial"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-white hover:border-primary/30"
            )}
          >
            <div className="absolute -top-3 right-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">7-Day Trial</span>
              <span className="font-bold text-xl">$0 <span className="text-sm font-normal text-muted-foreground">today</span></span>
            </div>
            <p className="text-muted-foreground text-sm">
              Try the full plan free for 7 days, then $29.99/mo. Cancel anytime.
            </p>
          </button>

          <button
            onClick={() => setSelectedPlan("year")}
            className={cn(
              "w-full p-6 rounded-2xl border-2 text-left transition-all duration-200",
              selectedPlan === "year"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-white hover:border-primary/30"
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">Yearly Access</span>
              <span className="font-bold text-xl">$99 <span className="text-sm font-normal text-muted-foreground">/year</span></span>
            </div>
            <div className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
              SAVE 70%
            </div>
          </button>
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border z-40">
          <div className="max-w-2xl mx-auto">
            <button className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center justify-center gap-2">
              START MY PLAN <Check className="w-6 h-6" />
            </button>
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure checkout</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 5-star rated</span>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
