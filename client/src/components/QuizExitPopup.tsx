import { motion, AnimatePresence } from "framer-motion";
import { Clock, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { landingContent } from "@/data/quizSteps";

interface QuizExitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  progress: number;
}

export default function QuizExitPopup({ isOpen, onClose, onContinue, progress }: QuizExitPopupProps) {
  const { locale } = useLocale();
  const content = landingContent[locale];

  const exitPopup = {
    "pt-BR": {
      title: "Espera! Seu diagnóstico está quase pronto",
      subtitle: "Você já completou",
      progress: "do quiz",
      benefit1: "Descubra seu perfil de aprendizado",
      benefit2: "Receba um plano personalizado grátis",
      benefit3: "Leva menos de 2 minutos",
      continueBtn: "Continuar meu diagnóstico",
      exitBtn: "Sair mesmo assim",
    },
    es: {
      title: "¡Espera! Tu diagnóstico está casi listo",
      subtitle: "Ya completaste",
      progress: "del quiz",
      benefit1: "Descubre tu perfil de aprendizaje",
      benefit2: "Recibe un plan personalizado gratis",
      benefit3: "Toma menos de 2 minutos",
      continueBtn: "Continuar mi diagnóstico",
      exitBtn: "Salir de todos modos",
    },
  };

  const t = exitPopup[locale];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-[70] bg-background rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-xl font-bold">
                  {t.title}
                </h2>

                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">{t.subtitle}</p>
                  <p className="text-3xl font-bold text-primary">{Math.round(progress)}%</p>
                  <p className="text-sm text-muted-foreground">{t.progress}</p>
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{t.benefit1}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Target className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{t.benefit2}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{t.benefit3}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={onContinue}
                    className="w-full py-6 text-base font-semibold"
                    data-testid="button-continue-quiz-exit"
                  >
                    {t.continueBtn}
                  </Button>
                  <button
                    onClick={onClose}
                    className="text-sm text-muted-foreground underline"
                    data-testid="button-exit-quiz"
                  >
                    {t.exitBtn}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
