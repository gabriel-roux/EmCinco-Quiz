import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface ExitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function ExitPopup({ isOpen, onClose, onContinue }: ExitPopupProps) {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    onContinue();
    setLocation("/result-final");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-background rounded-2xl p-6 w-[calc(100%-2rem)] max-w-md shadow-2xl"
          >
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-heading font-bold">
                Você sabia?
              </h2>
              <p className="text-muted-foreground">
                82% dos usuários aumentaram sua energia e performance diária após o primeiro mês com EmCinco
              </p>

              <div className="py-4">
                <div className="text-sm text-muted-foreground mb-2">Nível de Energia</div>
                <div className="relative h-32 bg-muted/30 rounded-lg overflow-hidden">
                  <svg viewBox="0 0 300 120" className="w-full h-full">
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    <path
                      d="M 20 80 Q 80 75 150 60 Q 220 45 280 25"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 80 Q 80 75 150 60 Q 220 45 280 25 L 280 100 L 20 100 Z"
                      fill="url(#greenGradient)"
                    />
                    
                    <path
                      d="M 20 80 Q 80 82 150 85 Q 220 88 280 95"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 80 Q 80 82 150 85 Q 220 88 280 95 L 280 100 L 20 100 Z"
                      fill="url(#redGradient)"
                    />
                    
                    <circle cx="20" cy="80" r="5" fill="#ef4444" />
                    <circle cx="150" cy="60" r="4" fill="#22c55e" />
                    <circle cx="150" cy="85" r="4" fill="#ef4444" />
                    <circle cx="280" cy="25" r="5" fill="#22c55e" />
                    <circle cx="280" cy="95" r="5" fill="#ef4444" />
                    
                    <text x="130" y="50" className="text-xs fill-green-600 font-medium">Usando EmCinco</text>
                    <text x="180" y="105" className="text-xs fill-red-500 font-medium">Sem EmCinco</text>
                  </svg>
                  
                  <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">Agora</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Hoje</div>
                  <div className="absolute bottom-2 right-4 text-xs text-muted-foreground">1º Mês</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">*Baseado em informações registradas pelos usuários</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 text-sm">
                <p>
                  Queremos que você alcance o seu melhor, por isso estamos oferecendo um{" "}
                  <span className="text-primary font-semibold">desconto exclusivo</span> no seu{" "}
                  <span className="text-primary font-semibold">Plano de Desenvolvimento Personalizado</span>
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full py-6 text-lg font-bold"
                data-testid="button-exit-continue"
              >
                CONTINUAR
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
