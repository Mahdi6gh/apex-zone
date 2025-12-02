import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, RotateCcw, Users, Clock, Crosshair } from 'lucide-react';

interface GameOverScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

export function GameOverScreen({ gameState, onRestart }: GameOverScreenProps) {
  const { isVictory, player, playersAlive, gameTime } = gameState;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-md animate-fade-in">
      <div className="text-center">
        {/* Victory/Defeat Icon */}
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
          isVictory ? 'bg-primary/20' : 'bg-accent/20'
        }`}>
          {isVictory ? (
            <Trophy className="w-12 h-12 text-primary animate-pulse-glow" />
          ) : (
            <Skull className="w-12 h-12 text-accent" />
          )}
        </div>

        {/* Title */}
        <h1 className={`font-orbitron text-5xl mb-2 ${
          isVictory ? 'text-primary text-glow-strong' : 'text-accent'
        }`}>
          {isVictory ? 'VICTORY ROYALE' : 'ELIMINATED'}
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          {isVictory 
            ? 'You are the last one standing!' 
            : `You placed #${playersAlive + 1}`}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-10">
          <div className="hud-panel px-6 py-4 text-center">
            <Crosshair className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="font-orbitron text-3xl text-foreground">{player.kills}</div>
            <div className="text-sm text-muted-foreground">Kills</div>
          </div>
          
          <div className="hud-panel px-6 py-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <div className="font-orbitron text-3xl text-foreground">{formatTime(gameTime)}</div>
            <div className="text-sm text-muted-foreground">Survived</div>
          </div>
          
          <div className="hud-panel px-6 py-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="font-orbitron text-3xl text-foreground">#{playersAlive + 1}</div>
            <div className="text-sm text-muted-foreground">Placement</div>
          </div>
        </div>

        {/* Restart Button */}
        <Button
          onClick={onRestart}
          size="lg"
          className="font-orbitron text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground pointer-events-auto"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          PLAY AGAIN
        </Button>
      </div>
    </div>
  );
}
