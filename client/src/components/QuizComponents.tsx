import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Loader2 } from "lucide-react";

interface OptionCardProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  subtitle?: string;
  isMulti?: boolean;
}

export function OptionCard({ label, selected, onClick, icon, subtitle, isMulti }: OptionCardProps) {
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
      {isMulti ? (
        <div className={cn(
          "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200",
          selected ? "bg-primary border-primary" : "bg-white border-border group-hover:border-primary/50"
        )}>
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
      ) : (
        selected && (
          <div className="absolute right-0 top-0 p-1.5 bg-primary rounded-bl-xl">
            <Check className="w-4 h-4 text-white" />
          </div>
        )
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

export function LikertScale({ value, onChange, labels = { min: "Discordo Totalmente", max: "Concordo Totalmente" } }: LikertScaleProps) {
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
  className?: string;
}

export function BottomBar({ onContinue, disabled, label = "Continuar", loading, className }: BottomBarProps) {
  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40", className)}>
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
            <span className="animate-pulse">Processando...</span>
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
      <h1 className="text-3xl md:text-4xl font-mono font-bold text-foreground leading-tight">
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

interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function OptimizedImage({ src, alt = "", className }: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-contain", className)}
      loading="lazy"
    />
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: "primary" | "orange" | "green" | "purple";
}

export function StatCard({ label, value, icon, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "from-primary/10 to-primary/5 border-primary/20",
    orange: "from-orange-50 to-orange-50/50 border-orange-200 dark:from-orange-900/20 dark:to-orange-900/10 dark:border-orange-800",
    green: "from-green-50 to-green-50/50 border-green-200 dark:from-green-900/20 dark:to-green-900/10 dark:border-green-800",
    purple: "from-purple-50 to-purple-50/50 border-purple-200 dark:from-purple-900/20 dark:to-purple-900/10 dark:border-purple-800",
  };

  const textColorClasses = {
    primary: "text-primary",
    orange: "text-orange-600 dark:text-orange-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 rounded-xl bg-gradient-to-br border backdrop-blur-sm",
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1.5">
            {label}
          </div>
          <div className={cn("font-semibold text-base truncate", textColorClasses[color])}>
            {value}
          </div>
        </div>
        {icon && (
          <div className={cn("flex-shrink-0", textColorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ProgressBarProps {
  value: number;
  label: string;
  status: string;
  statusColor?: "orange" | "green" | "red" | "yellow";
}

export function ProgressBar({ value, label, status, statusColor = "orange" }: ProgressBarProps) {
  const barColors = {
    orange: "bg-gradient-to-r from-orange-400 to-orange-500",
    green: "bg-gradient-to-r from-green-400 to-green-500",
    red: "bg-gradient-to-r from-red-400 to-red-500",
    yellow: "bg-gradient-to-r from-yellow-400 to-yellow-500",
  };

  const textColors = {
    orange: "text-orange-500",
    green: "text-green-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-semibold">
        <span className="text-foreground">{label}</span>
        <span className={textColors[statusColor]}>{status}</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className={cn("h-full rounded-full", barColors[statusColor])}
        />
      </div>
    </div>
  );
}

interface TimelineItemProps {
  week: string;
  text: string;
  color: "red" | "orange" | "yellow" | "green";
  index: number;
}

export function TimelineItem({ week, text, color, index }: TimelineItemProps) {
  const colorStyles = {
    red: "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    orange: "border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    yellow: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    green: "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      className="flex items-center gap-4 relative z-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.15 + 0.1, type: "spring" }}
        className={cn(
          "w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center shadow-sm",
          colorStyles[color]
        )}
      >
        <span className="text-xs font-bold">{index + 1}</span>
      </motion.div>
      <div className="flex-1">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{week}</div>
        <div className="font-semibold text-lg text-foreground">{text}</div>
      </div>
    </motion.div>
  );
}

export function DiagnosisStep({ onContinue }: { onContinue: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-xl font-medium text-muted-foreground animate-pulse">
              Analisando suas respostas...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-xl space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-mono font-bold text-foreground leading-tight">
                Pronto. Já entendemos seu perfil. ✅
              </h2>
              
              <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Pelas suas respostas, dá pra ver que o problema não é falta de vontade ou capacidade.
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  O maior desafio hoje é encontrar tempo, manter o foco e seguir um método que realmente caiba na sua rotina.
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Isso é mais comum do que parece. Muita gente inteligente e dedicada passa exatamente por isso.
                </motion.p>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-4">
              <p className="font-semibold text-foreground text-lg italic">
                "É por isso que a próxima pergunta é tão importante:"
              </p>
              <p className="text-primary font-bold text-xl">
                Diga quanto tempo por dia você realmente consegue separar para evoluir.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
