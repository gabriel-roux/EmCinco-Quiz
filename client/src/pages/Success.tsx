import { Check, Rocket, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Success() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Pagamento Confirmado!
          </h1>
          <p className="text-muted-foreground">
            Parabéns! Você acaba de dar o primeiro passo para transformar seus hábitos de aprendizado.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Confira seu email</div>
              <div className="text-sm text-muted-foreground">
                Enviamos suas credenciais de acesso
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Comece agora</div>
              <div className="text-sm text-muted-foreground">
                Sua primeira missão já está disponível
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button className="w-full py-6 text-lg font-bold" data-testid="button-access-plan">
            ACESSAR MEU PLANO
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Você receberá um email com todas as instruções de acesso
          </p>
        </div>
      </motion.div>
    </div>
  );
}
