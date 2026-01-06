import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

interface OptionCardProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  subtitle?: string;
}

export function OptionCard({ label, selected, onClick, icon, subtitle }: OptionCardProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group relative overflow-hidden",
        selected 
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
          : "border-border bg-card hover:border-primary/30 hover:shadow-md"
      )}
    >
      {selected && (
        <div className="absolute right-0 top-0 p-1.5 bg-primary rounded-bl-xl">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      {icon && (
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors",
          selected ? "bg-primary text-white" : "bg-white text-muted-foreground group-hover:text-primary"
        )}>
          {icon}
        </div>
      )}
      
      <div className="flex-1">
        <h3 className={cn(
          "font-semibold text-lg transition-colors",
          selected ? "text-primary" : "text-foreground"
        )}>
          {label}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </motion.button>
  );
}

interface LikertScaleProps {
  value: number | null;
  onChange: (val: number) => void;
  labels?: { min: string; max: string };
}

export function LikertScale({ value, onChange, labels = { min: "Strongly Disagree", max: "Strongly Agree" } }: LikertScaleProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between w-full gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={cn(
              "flex-1 aspect-square rounded-xl border-2 font-bold text-xl transition-all duration-200 flex items-center justify-center",
              value === num 
                ? "border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
            )}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
        <span>{labels.min}</span>
        <span>{labels.max}</span>
      </div>
    </div>
  );
}

interface BottomBarProps {
  onContinue: () => void;
  disabled?: boolean;
  label?: string;
  loading?: boolean;
}

export function BottomBar({ onContinue, disabled, label = "Continue", loading }: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40">
      <div className="max-w-3xl mx-auto w-full">
        <button
          onClick={onContinue}
          disabled={disabled || loading}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300",
            disabled 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              {label} <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface QuestionHeaderProps {
  title: string;
  subtitle?: string;
  micro?: string;
}

export function QuestionHeader({ title, subtitle, micro }: QuestionHeaderProps) {
  return (
    <div className="mb-8 text-center md:text-left space-y-3">
      {micro && (
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          {micro}
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
