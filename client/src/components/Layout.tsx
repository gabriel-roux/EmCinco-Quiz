import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import newLogo from "@assets/LOGO-EMCINCO_1768418486475.png";

interface LayoutProps {
  children: ReactNode;
  progress?: number;
  hideHeader?: boolean;
  onBack?: () => void;
  showBack?: boolean;
}

export function Layout({ children, progress, hideHeader = false, onBack, showBack = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar - Full width at very top */}
      {progress !== undefined && !hideHeader && (
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gray-200 overflow-hidden">
          <div 
            className="h-full bg-primary"
            style={{ 
              width: `${progress}%`,
              transition: 'width 0.3s ease-out'
            }}
          />
        </div>
      )}

      {/* Top Bar */}
      {!hideHeader && (
        <header className="fixed top-1 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border h-14 flex items-center px-4 md:px-8">
          <div className="max-w-xl mx-auto w-full flex items-center justify-center relative">
            <div className="absolute left-0 flex items-center gap-2">
              {showBack && onBack && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onBack}
                  className="shrink-0"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <Link href="/" className="flex items-center">
                <img src={newLogo} alt="EmCinco Logo" className="h-6 w-auto" />
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content - Top aligned below header */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 md:px-6 pt-20 pb-32">
        {children}
      </main>
    </div>
  );
}
