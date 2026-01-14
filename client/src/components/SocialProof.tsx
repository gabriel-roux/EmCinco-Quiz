import { useEffect, useState } from 'react';

export default function SocialProof() {
  const [activeUsers, setActiveUsers] = useState(() => {
    const saved = localStorage.getItem('emcinco_active_users');
    return saved ? parseInt(saved, 10) : 23;
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const getNextValue = (current: number) => {
      // Logic: Max variation of 2, range 18-37, never 0, max 50
      const change = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
      let next = current + change;
      
      if (next < 18) next = 18 + Math.floor(Math.random() * 3);
      if (next > 37) next = 37 - Math.floor(Math.random() * 3);
      
      return next;
    };

    const updateValue = () => {
      setActiveUsers((current) => {
        const next = getNextValue(current);
        localStorage.setItem('emcinco_active_users', next.toString());
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        return next;
      });

      // Schedule next update between 6-12s
      const nextDelay = Math.floor(Math.random() * (12000 - 6000 + 1)) + 6000;
      timeoutId = setTimeout(updateValue, nextDelay);
    };

    let timeoutId = setTimeout(updateValue, Math.floor(Math.random() * 6000) + 6000);
    return () => clearTimeout(timeoutId);
  }, []);

  const avatarStack = (
    <div className="flex -space-x-2 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-[#EEF4FF] bg-gray-200">
          <img
            className="h-full w-full rounded-full grayscale opacity-70"
            src={`https://i.pravatar.cc/100?img=${i + 10}`}
            alt=""
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full flex justify-center py-4">
      <div className="bg-[#EEF4FF] rounded-2xl px-6 py-4 flex items-center justify-center gap-6 text-[13px] md:text-sm font-medium border border-blue-100/50 shadow-sm animate-in fade-in zoom-in duration-500">
        {/* Left Block */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-muted-foreground whitespace-nowrap">Pessoas que já descobriram seu perfil</span>
          <div className="flex items-center gap-2">
            {avatarStack}
            <span className="font-bold text-foreground tracking-tight">+847</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-[1px] bg-blue-200/60" />

        {/* Right Block */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-muted-foreground whitespace-nowrap">Descobrindo agora</span>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-[#EEF4FF] bg-blue-100">
                  <img
                    className="h-full w-full rounded-full"
                    src={`https://i.pravatar.cc/100?img=${i + 20}`}
                    alt=""
                  />
                </div>
              ))}
            </div>
            <span 
              className={`font-bold text-primary transition-all duration-500 transform ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              {activeUsers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
