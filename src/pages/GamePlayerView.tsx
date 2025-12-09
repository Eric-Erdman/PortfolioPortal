
import React from 'react';
import { useParams } from 'react-router-dom';
import { GameView } from './GameView';
import { useGameContext } from '../contexts/GameContext';

// This wrapper reads the playerName from the URL and ensures it is set in localStorage for GameView
export default function GamePlayerView() {
  const { playerName } = useParams();
  const { enterGame } = useGameContext();
  React.useEffect(() => {
    if (playerName) {
      localStorage.setItem('catanPlayerName', playerName);
      enterGame('catan');
    }
  }, [playerName, enterGame]);
  return <GameView />;
}
