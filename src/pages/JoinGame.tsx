import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue, runTransaction } from 'firebase/database';


export default function JoinGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();
  // Listen for game start (placement node exists)
  useEffect(() => {
    if (!gameId) return;
    const placementRef = ref(db, `lobbies/${gameId}/placement`);
    const unsub = onValue(placementRef, (snap) => {
      if (snap.exists()) {
        setGameStarted(true);
      }
    });
    return () => unsub();
  }, [gameId]);

  // Redirect to game view when started
  useEffect(() => {
    if (gameStarted && playerName) {
      // Store player name for use in main game view
      localStorage.setItem('catanPlayerName', playerName);
      navigate(`/game/catan/${encodeURIComponent(playerName)}`);
    }
  }, [gameStarted, playerName, navigate]);

  useEffect(() => {
    if (!gameId) return;
    const playersRef = ref(db, `lobbies/${gameId}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const val = snapshot.val();
      if (Array.isArray(val)) {
        setPlayers(val.filter(Boolean));
        setPlayerCount(val.filter(Boolean).length);
      } else {
        setPlayers([]);
        setPlayerCount(0);
      }
    });
    return () => unsubscribe();
  }, [gameId]);

  async function handleJoin() {
    if (!gameId || !playerName.trim()) return;
    const playersRef = ref(db, `lobbies/${gameId}/players`);
    await runTransaction(playersRef, (currentPlayers) => {
      if (!Array.isArray(currentPlayers)) currentPlayers = [];
      if (!currentPlayers.includes(playerName)) {
        return [...currentPlayers, playerName];
      }
      return currentPlayers;
    });
    setJoined(true);
  }

  if (!gameId) return <div>Invalid game link.</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 32, boxShadow: '0 4px 32px rgba(0,0,0,0.2)', minWidth: 320 }}>
        <h2 style={{ fontFamily: 'UnifrakturCook, serif', fontSize: 32, color: '#fff', marginBottom: 16 }}>Join Game</h2>
        {joined ? (
          <>
            <div style={{ color: '#fff', marginBottom: 16 }}>
              {gameStarted ? 'Game is starting...' : 'Waiting for host to start the game...'}
            </div>
            <div style={{ color: '#aaa', fontSize: 18 }}>Players joined: <b>{playerCount}</b></div>
            <div style={{ color: '#aaa', fontSize: 16, marginTop: 8 }}>
              {players.map((p, i) => <div key={i}>{p}</div>)}
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              style={{ padding: 12, borderRadius: 8, border: '1px solid #444', width: '100%', marginBottom: 16, fontSize: 18 }}
            />
            <button
              onClick={handleJoin}
              style={{ padding: '12px 24px', borderRadius: 8, background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)', color: '#232526', fontWeight: 'bold', fontSize: 18, border: 'none', cursor: 'pointer', width: '100%' }}
            >
              Join Game
            </button>
            <div style={{ color: '#aaa', fontSize: 18, marginTop: 16 }}>Players joined: <b>{playerCount}</b></div>
            <div style={{ color: '#aaa', fontSize: 16, marginTop: 8 }}>
              {players.map((p, i) => <div key={i}>{p}</div>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
