import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { trackPurchase, sendServerEvent } from "@/lib/facebookPixel";

export default function Success() {
  const name = localStorage.getItem("emcinco_name") || "Guerreiro(a)";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-12 px-4 pb-12">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="mb-8"
      >
        <div className="bg-primary/10 p-4 rounded-full">
          <CheckCircle2 className="w-20 h-20 text-primary" />
        </div>
      </motion.div>

      <div className="text-center space-y-4 max-w-md mx-auto mb-12">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-heading font-bold text-foreground"
        >
          Parabéns, {name}!
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground"
        >
          Seu acesso vitalício ao EmCinco e à Comunidade Mastermind foi confirmado com sucesso.
        </motion.p>
      </div>

      <div className="grid gap-6 w-full max-w-xl">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-primary p-2 rounded-lg text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Seu Plano está Pronto</h3>
                <p className="text-sm text-muted-foreground">
                  As suas primeiras 4 semanas de missões personalizadas já foram geradas com base no seu perfil.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-blue-500 p-2 rounded-lg text-white">
                <Download className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Próximos Passos</h3>
                <p className="text-sm text-muted-foreground">
                  Enviamos um e-mail com o seu guia de boas-vindas e o link de acesso exclusivo à nossa comunidade privada.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 w-full max-w-md space-y-4"
      >
        <Link href="/">
          <Button className="w-full py-8 text-xl font-bold rounded-2xl shadow-xl hover-elevate">
            ACESSAR MEU PLANO AGORA
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </Link>
        <p className="text-center text-sm text-muted-foreground">
          Você será redirecionado para o seu dashboard pessoal.
        </p>
      </motion.div>
    </div>
  );
}
