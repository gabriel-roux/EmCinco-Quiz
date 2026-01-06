import { ReactNode } from "react";
import { Link } from "wouter";

interface LayoutProps {
  children: ReactNode;
  progress?: number;
  hideHeader?: boolean;
}

export function Layout({ children, progress, hideHeader = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Top Bar */}
      {!hideHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center px-4 md:px-8">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-4">
            <Link href="/" className="font-heading font-bold text-xl text-primary flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              SkillSprint
            </Link>
            
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

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl px-4 md:px-6 py-24 md:py-32 flex flex-col justify-center">
        {children}
      </main>
    </div>
  );
}
