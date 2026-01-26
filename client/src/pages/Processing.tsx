import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    title: "Este plano trouxe minha energia de volta",
    text: "Acordo me sentindo renovado, focado e eu mesmo novamente. As pessoas dizem que pareco mais vivo, e honestamente, eu sinto isso tambem."
  },
  {
    title: "Finalmente tenho clareza mental",
    text: "Eu costumava me sentir mentalmente exausto o tempo todo. Agora tenho energia o dia inteiro e consigo focar nas coisas importantes."
  },
  {
    title: "Mudou minha rotina completamente",
    text: "Em apenas 5 minutos por dia, construi habitos que transformaram minha produtividade. Nao imaginava que seria tao simples."
  },
  {
    title: "Resultados visiveis em 2 semanas",
    text: "Minha concentracao melhorou drasticamente. Consigo trabalhar por horas sem distracao e ainda tenho energia no fim do dia."
  }
];

export default function Processing() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const increment = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    const redirect = setTimeout(() => {
      setLocation("/result");
    }, duration + 500);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [setLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl font-mono font-bold text-foreground">EmCinco</h1>
      </div>

      <div className="relative w-56 h-56 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="90"
            fill="none"
            stroke="hsl(var(--muted) / 0.15)"
            strokeWidth="8"
          />
          <motion.circle
            cx="112"
            cy="112"
            r="90"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-foreground">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="text-center space-y-2 mb-10">
        <p className="text-lg text-muted-foreground">Criando seu Plano de Recuperacao</p>
        <p className="text-2xl font-bold text-primary">Mais de 9.000 pessoas</p>
        <p className="text-muted-foreground font-medium">escolheram o emcinco</p>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-card/15 backdrop-blur-sm rounded-2xl p-6"
          >
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h3 className="font-bold text-foreground mb-2">
              {testimonials[currentTestimonial].title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {testimonials[currentTestimonial].text}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentTestimonial ? "bg-primary" : "bg-muted/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
