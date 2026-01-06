import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

export default function Processing() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setLocation("/result");
    }, 3500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  const messages = [
    "Analyzing your learning blockers...",
    "Calibrating difficulty level...",
    "Designing your 5-minute daily missions...",
    "Finalizing your SkillSprint Plan..."
  ];

  return (
    <Layout hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
        </div>
        
        <div className="h-20">
          {messages.map((msg, i) => (
            <motion.p
              key={msg}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: [10, 0, 0, -10]
              }}
              transition={{ 
                duration: 3, 
                delay: i * 0.8,
                times: [0, 0.1, 0.9, 1]
              }}
              className="absolute left-0 right-0 text-xl font-medium text-foreground"
            >
              {msg}
            </motion.p>
          ))}
        </div>
      </div>
    </Layout>
  );
}
