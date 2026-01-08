import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      {/* Top Bar */}
      {!hideHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center px-4 md:px-8">
          <div className="max-w-xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
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
              <Link href="/" className="font-heading font-bold text-xl text-primary">
                FOCO5
              </Link>
            </div>
            
            {progress !== undefined && (
              <div className="flex-1 max-w-[200px] h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content - Top aligned below header */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 md:px-6 pt-24 pb-32">
        {children}
      </main>
    </div>
  );
}
