import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { ref, onValue, runTransaction } from 'firebase/database';
import { Button } from '../Common/Button';
import type { MatchUpGame } from './types';

const MatchUpGameScreen: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  // const navigate = useNavigate();
  const [gameData, setGameData] = useState<MatchUpGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [ready, setReady] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [playerName, setPlayerName] = useState('');

  // Get player name from localStorage (should be set on join)
  useEffect(() => {
    if (!gameId) return;
    const stored = localStorage.getItem(`matchup-player-${gameId}`);
    if (stored) setPlayerName(stored);
  }, [gameId]);

  // Listen for game data and ready state
  useEffect(() => {
    if (!gameId) return;
    const gameRef = ref(db, `matchup-lobbies/${gameId}`);
    const unsub = onValue(gameRef, (snap) => {
      const data = snap.val();
      if (data) {
        setGameData(data);
        setLoading(false);
        // Check if all players are ready
        if (data.readyPlayers && data.players && data.readyPlayers.length === data.players.length) {
          setAllReady(true);
          setTimeout(() => setShowIntro(false), 1200); // Hide intro after 1.2s
        } else {
          setAllReady(false);
          setShowIntro(true);
        }
      }
    });
    return () => unsub();
  }, [gameId]);

  // Mark self as ready
  const handleReady = async () => {
    if (!gameId || !playerName) return;
    await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
      if (!currentData) return currentData;
      const readyPlayers = currentData.readyPlayers || [];
      if (!readyPlayers.includes(playerName)) {
        return { ...currentData, readyPlayers: [...readyPlayers, playerName] };
      }
      return currentData;
    });
    setReady(true);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif',
        overflow: 'hidden',
      }}>
        <div style={{
          color: '#f3e8ff',
          fontSize: '4rem',
          fontWeight: 900,
          letterSpacing: '0.12em',
          textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
          textTransform: 'uppercase',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          MATCH-UP
          <div style={{ fontSize: '1.5rem', marginTop: 32, color: '#c084fc', fontWeight: 700, textAlign: 'center' }}>
            Waiting for players to ready up
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontSize: '2rem' }}>{error}</div>;
  }

  // Centered intro/ready screen
  if (showIntro && gameData) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif',
        overflow: 'hidden',
      }}>
        <div style={{
          color: '#f3e8ff',
          fontSize: '4rem',
          fontWeight: 900,
          letterSpacing: '0.12em',
          textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
          textTransform: 'uppercase',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>MATCH-UP
          <div style={{ fontSize: '1.5rem', marginTop: 32, color: '#c084fc', fontWeight: 700, textAlign: 'center' }}>
            {allReady ? 'All players ready!' : 'Waiting for all players to ready up...'}
          </div>
          {!ready && !allReady && (
            <Button style={{ marginTop: 32, fontSize: '1.3rem', padding: '0.5em 2em', background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)', color: '#f3e8ff', border: '2px solid #f3e8ff', borderRadius: '1.5em', fontFamily: 'Orbitron, sans-serif', fontWeight: 700, cursor: 'pointer' }} onClick={handleReady}>
              Ready Up
            </Button>
          )}
          {ready && !allReady && (
            <div style={{ marginTop: 32, color: '#f3e8ff', fontSize: '1.1rem' }}>You are ready!</div>
          )}
        </div>
      </div>
    );
  }

  // ...existing matchup UI (replace with your actual game logic)
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Orbitron, sans-serif',
      overflow: 'hidden',
    }}>
      <div style={{ color: '#f3e8ff', fontSize: '2.5rem', fontWeight: 700 }}>Game in progress...</div>
      {/* TODO: Add actual matchup UI here */}
    </div>
  );
};

export default MatchUpGameScreen;


