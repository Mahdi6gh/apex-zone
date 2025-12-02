import { useState } from 'react';
import { Game } from '@/components/game/Game';
import { Button } from '@/components/ui/button';
import { Gamepad2, Target, Shield, Map, Skull } from 'lucide-react';

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);

  if (gameStarted) {
    return <Game />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTJiM2QiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0tNC00aC0ydi0yaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
      
      <div className="relative z-10 text-center px-4">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="font-orbitron text-6xl md:text-8xl font-black text-primary text-glow-strong mb-2">
            ZONE
          </h1>
          <h2 className="font-orbitron text-3xl md:text-4xl text-foreground">
            BATTLE ROYALE
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-md mx-auto">
          30 بازیکن وارد می‌شوند. فقط یک نفر پیروز می‌شود.
        </p>

        {/* Play Button */}
        <Button
          onClick={() => setGameStarted(true)}
          size="lg"
          className="font-orbitron text-xl px-12 py-8 bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse-glow mb-12"
        >
          <Gamepad2 className="w-6 h-6 mr-3" />
          شروع بازی
        </Button>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="hud-panel p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="font-orbitron text-sm text-foreground">سلاح‌های متنوع</div>
          </div>
          <div className="hud-panel p-4 text-center">
            <Map className="w-8 h-8 mx-auto mb-2 text-zone-safe" />
            <div className="font-orbitron text-sm text-foreground">زون پویا</div>
          </div>
          <div className="hud-panel p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-secondary" />
            <div className="font-orbitron text-sm text-foreground">شیلد و سلامت</div>
          </div>
          <div className="hud-panel p-4 text-center">
            <Skull className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="font-orbitron text-sm text-foreground">30 دشمن AI</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 text-muted-foreground text-sm">
          <div className="flex justify-center gap-8">
            <div>
              <span className="font-orbitron text-foreground">WASD</span> - حرکت
            </div>
            <div>
              <span className="font-orbitron text-foreground">Mouse</span> - نشانه‌گیری
            </div>
            <div>
              <span className="font-orbitron text-foreground">Click</span> - شلیک
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
