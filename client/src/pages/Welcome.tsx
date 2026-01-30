import { useLocation } from "wouter";
import { Zap, MessageSquare, CheckCircle, Clock, Brain } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { landingContent } from "@/data/quizSteps";
import { useState, useEffect } from "react";

const avatars = [
  "/images/avatar1.webp",
  "/images/avatar2.webp",
  "/images/avatar3.webp",
  "/images/avatar4.webp",
  "/images/avatar5.webp",
  "/images/avatar6.webp",
];

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { locale } = useLocale();
  const landing = landingContent[locale];
  const [liveCount, setLiveCount] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(35, Math.min(55, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full text-center animate-fade-in">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Zap className="w-3.5 h-3.5" />
              {landing.badge}
            </span>
          </div>

          <div className="mb-4">
            <img
              src="/images/logo.webp"
              alt="EmCinco"
              width={150}
              height={50}
              className="h-14 mx-auto"
            />
          </div>

          <p className="text-muted-foreground text-base mb-8 leading-relaxed max-w-sm mx-auto">
            {landing.subtitle}
          </p>

          <div className="flex items-stretch justify-center gap-3 mb-8">
            <div className="flex-1 bg-primary/5 rounded-2xl px-4 py-3 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">
                {landing.socialProofLabel}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  <img
                    src={avatars[0]}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-background object-cover"
                  />
                  <img
                    src={avatars[1]}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-background object-cover"
                  />
                  <img
                    src={avatars[2]}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-background object-cover"
                  />
                </div>
                <span className="text-sm font-bold">+847</span>
              </div>
            </div>
            <div className="flex-1 bg-primary/5 rounded-2xl px-4 py-3 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">
                {landing.discoveringNow}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  <img
                    src={avatars[3]}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-background object-cover"
                  />
                  <img
                    src={avatars[4]}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-background object-cover"
                  />
                  <img
                    src={avatars[5]}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-background object-cover"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-sm font-bold">{liveCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <button
              className="relative w-full py-5 text-base font-semibold gap-2 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors flex items-center justify-center overflow-hidden"
              onClick={() => setLocation("/quiz")}
              data-testid="button-start-quiz"
            >
              <span className="absolute inset-0 rounded-2xl animate-pulse bg-white/10"></span>
              <MessageSquare className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{landing.ctaDiscover}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{landing.feature1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>{landing.feature2}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-500" />
              <span>{landing.feature3}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
