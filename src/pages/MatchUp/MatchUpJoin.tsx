import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { ref, onValue, runTransaction, set } from 'firebase/database';
import { Button } from '../Common/Button';

type MatchUpLobby = {
  players: string[];
  max: number;
  phase?: string;
};

const MatchUpJoin: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [lobbyData, setLobbyData] = useState<MatchUpLobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    const actualGameId = gameId.startsWith('matchup-') ? gameId.substring(8) : gameId;
    const lobbyRef = ref(db, `matchup-lobbies/${actualGameId}`);
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLobbyData(data);
        setLoading(false);
        const storedPlayerName = localStorage.getItem(`matchup-player-${actualGameId}`);
        // If player is already in the game and phase is ready-check, redirect to game screen
        if (storedPlayerName && data.players && data.players.includes(storedPlayerName) && data.phase === 'ready-check') {
          navigate(`/game/matchup/${actualGameId}/${storedPlayerName}`);
        }
      } else {
        setError('Game not found');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [gameId, navigate]);

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }
    if (!gameId) return;
    const actualGameId = gameId.startsWith('matchup-') ? gameId.substring(8) : gameId;
    setJoining(true);
    try {
      let updatedPlayers: string[] = [];
      let phase = undefined;
      await runTransaction(ref(db, `matchup-lobbies/${actualGameId}`), (currentData) => {
        if (!currentData) return null;
        const players = currentData.players || [];
        phase = currentData.phase;
        if (players.length >= currentData.max) {
          setError('Game is full');
          return currentData;
        }
        if (players.includes(playerName.trim())) {
          setError('Player name already taken');
          return currentData;
        }
        updatedPlayers = [...players, playerName.trim()];
        return {
          ...currentData,
          players: updatedPlayers
        };
      });
      // Ensure the /players child is updated for host's listener
      await set(ref(db, `matchup-lobbies/${actualGameId}/players`), updatedPlayers);
      localStorage.setItem(`matchup-player-${actualGameId}`, playerName.trim());
      // Only redirect if phase is ready-check
      if (phase === 'ready-check') {
        navigate(`/game/matchup/${actualGameId}/${playerName.trim()}`);
      }
    } catch (error) {
      setError('Failed to join game. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, sans-serif' }}>
        <div style={{ color: '#f3e8ff', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Loading...</div>
      </div>
    );
  }
  // Only show waiting screens if player is already in the lobby
  const actualGameId = gameId && gameId.startsWith('matchup-') ? gameId.substring(8) : gameId;
  const storedPlayerName = actualGameId ? localStorage.getItem(`matchup-player-${actualGameId}`) : null;
  const isPlayerInLobby = storedPlayerName && lobbyData && lobbyData.players && lobbyData.players.includes(storedPlayerName);

  // Show purple gradient 'Game is starting...' screen if phase is 'starting' and player is in lobby
  if (lobbyData && lobbyData.phase === 'starting' && isPlayerInLobby) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, sans-serif' }}>
        <h1 style={{ fontSize: '2.8rem', color: '#f3e8ff', textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9', marginBottom: '2rem', letterSpacing: '0.08em', textAlign: 'center', fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase' }}>Game is starting...</h1>
        <div style={{ color: '#f3e8ff', fontSize: '1.3rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 700 }}>Please wait for the host to finish setup.</div>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
      </div>
    );
  }
  if (error && !lobbyData) {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, sans-serif' }}>
        <div style={{ color: '#f87171', fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 700, textTransform: 'uppercase' }}>{error}</div>
        <Button style={{ fontSize: '1.2rem', padding: '0.5em 2em', background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)', color: '#f3e8ff', border: '2px solid #f3e8ff', borderRadius: '1.5em', fontFamily: 'Orbitron, sans-serif', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }
  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, sans-serif' }}>
      <h1 style={{ fontSize: '2.8rem', color: '#f3e8ff', textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9', marginBottom: '2rem', letterSpacing: '0.08em', textAlign: 'center', fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase' }}>Join Match Up</h1>
      <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '2px solid #a855f7', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', minWidth: '300px' }}>
        <div style={{ color: '#f3e8ff', fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center' }}>Players: {lobbyData?.players?.length || 0} / {lobbyData?.max || 0}</div>
        <input type="text" placeholder="Enter your name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()} style={{ width: '100%', padding: '0.75rem', fontSize: '1.1rem', borderRadius: '0.5rem', border: '2px solid #a855f7', background: 'rgba(248, 250, 252, 0.95)', marginBottom: '1rem', boxSizing: 'border-box', fontFamily: 'inherit' }} disabled={joining} />
        {error && (<div style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>)}
        <Button style={{ width: '100%', fontSize: '1.2rem', padding: '0.75em', background: joining ? '#6b7280' : 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)', color: '#f3e8ff', border: '2px solid #f3e8ff', borderRadius: '0.75em', fontFamily: 'Orbitron, sans-serif', fontWeight: 800, cursor: joining ? 'not-allowed' : 'pointer', opacity: joining ? 0.6 : 1, textTransform: 'uppercase' }} onClick={handleJoinGame} disabled={joining}>{joining ? 'Joining...' : 'Join Game'}</Button>
      </div>
      <Button style={{ fontSize: '1rem', padding: '0.5em 1.5em', background: 'transparent', color: '#c084fc', border: '1px solid #c084fc', borderRadius: '0.5em', fontFamily: 'Orbitron, sans-serif', cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => navigate('/')}>Back to Dashboard</Button>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
    </div>
  );
};

export default MatchUpJoin;
