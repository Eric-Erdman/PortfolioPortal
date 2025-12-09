
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface GameContextType {
  currentGame: string | null;
  enterGame: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const enterGame = (id: string) => {
    setCurrentGame(id);
  };

  const value: GameContextType = {
    currentGame,
    enterGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
