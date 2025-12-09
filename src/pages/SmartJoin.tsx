import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import JoinGame from './JoinGame';
import MatchUpJoin from './MatchUp/MatchUpJoin';

// This component checks Firebase to see if the gameId is a Catan or MatchUp lobby
// and renders the correct join screen.
const SmartJoin: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [lobbyType, setLobbyType] = useState<'catan' | 'matchup' | 'notfound' | null>(null);

  useEffect(() => {
    if (!gameId) return;
    // Check matchup-lobbies first
    get(ref(db, `matchup-lobbies/${gameId}`)).then((snap) => {
      if (snap.exists()) {
        setLobbyType('matchup');
      } else {
        // Check catan lobbies
        get(ref(db, `lobbies/${gameId}`)).then((snap2) => {
          if (snap2.exists()) {
            setLobbyType('catan');
          } else {
            setLobbyType('notfound');
          }
        });
      }
    });
  }, [gameId]);

  if (lobbyType === null) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>Loading...</div>;
  }
  if (lobbyType === 'notfound') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#f87171' }}>Game not found.</div>;
  }
  if (lobbyType === 'matchup') {
    return <MatchUpJoin />;
  }
  // Default to catan
  return <JoinGame />;
};

export default SmartJoin;
