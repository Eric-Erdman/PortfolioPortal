
import React, { useState, useEffect } from 'react';

import { db } from '../firebase';
import { ref, onValue, set, runTransaction, update } from 'firebase/database';

// TypeScript: declare global window property for in-memory lobbies
declare global {
  interface Window {
    _catanLobbies?: Record<string, { players: string[]; max?: number }>;
  }
}
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './Common/Button';
import { useGameContext } from '../contexts/GameContext';
import { QRCodeDisplay } from './Common/QRCodeDisplay';
import { HexBoard } from './Catan/HexBoard';

// Medieval-styled Catan main menu


type ClaimedSpot = { type: 'house' | 'road'; id: number; player: number };

type PlayerPlacementSelectorProps = {
  claimedSpots: ClaimedSpot[];
  type: 'house' | 'road';
  onSelect: (id: number) => void;
  boardSize: number;
};

const PlayerPlacementSelector: React.FC<PlayerPlacementSelectorProps> = ({ claimedSpots, type, onSelect, boardSize }) => {
  // For 19/30 tiles, get number of vertices/edges
  const houseCount = boardSize === 19 ? 54 : 91;
  const roadCount = boardSize === 19 ? 72 : 138;
  const max = type === 'house' ? houseCount : roadCount;
  const taken = claimedSpots.filter(s => s.type === type).map(s => s.id);
  const available: number[] = [];
  for (let i = 1; i <= max; i++) {
    if (!taken.includes(i)) available.push(i);
  }
  return (
    <div style={{ marginTop: 24, background: '#fffbe6', border: '2px solid #bfa76a', borderRadius: 12, padding: 18, boxShadow: '0 2px 12px #bfa76a55', fontFamily: 'JetBrains Mono,monospace', maxWidth: 600 }}>
      <div style={{ fontWeight: 700, fontSize: 20, color: '#6b3e26', marginBottom: 10 }}>
        Select {type === 'house' ? 'House' : 'Road'} Spot:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {available.map((id) => (
          <button key={id} style={{ fontSize: 16, padding: '0.4em 1.1em', borderRadius: 8, background: '#bfa76a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => onSelect(id)}>
            {type === 'house' ? `H${id}` : `R${id}`}
          </button>
        ))}
      </div>
    </div>
  );
};


// Helper to get player name from localStorage (simulate login)
function getLocalPlayerName() {
  return localStorage.getItem('catanPlayerName') || '';
}

export const GameView: React.FC = () => {
  const navigate = useNavigate();
  const { gameId: urlGameId } = useParams<{ gameId: string }>();
  const { currentGame, enterGame } = useGameContext();
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [gameId, setGameId] = useState<string | null>(urlGameId || null);
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerOrder, setPlayerOrder] = useState<string[]>([]); // shuffled order for snake draft
  const [localIp, setLocalIp] = useState<string | null>(null);
  const [localPlayerName, setLocalPlayerName] = useState<string>(getLocalPlayerName());
  const [gameStarted, setGameStarted] = useState(false);
  const [boardChoice, setBoardChoice] = useState<'19' | '30' | null>(null);
  // Placement phase state
  const [claimedSpots, setClaimedSpots] = useState<ClaimedSpot[]>([]);
  const [placementPhase, setPlacementPhase] = useState<'setup' | 'done'>('setup');
  const [placementCount, setPlacementCount] = useState(0); // how many placements so far

  // If URL gameId is provided, use it and set the game context
  useEffect(() => {
    if (urlGameId) {
      setGameId(urlGameId);
      // Set the current game to 'catan' when entering GameView
      if (currentGame !== 'catan') {
        enterGame('catan');
      }
    }
  }, [urlGameId, currentGame, enterGame]);

  // Listen for player list changes in Firebase
  useEffect(() => {
    if (!gameId) return;
    const playersRef = ref(db, `lobbies/${gameId}/players`);
    const orderRef = ref(db, `lobbies/${gameId}/playerOrder`);
    const unsubPlayers = onValue(playersRef, (snapshot) => {
      const val = snapshot.val();
      if (Array.isArray(val)) {
        setPlayers(val.filter(Boolean));
        setPlayerCount(val.filter(Boolean).length);
      } else {
        setPlayers([]);
        setPlayerCount(0);
      }
    });
    const unsubOrder = onValue(orderRef, (snapshot) => {
      const val = snapshot.val();
      if (Array.isArray(val)) {
        setPlayerOrder(val);
      }
    });
    return () => { unsubPlayers(); unsubOrder(); };
  }, [gameId]);

  // On join page, let user enter their name and join lobby
  useEffect(() => {
    // If on join page (URL contains /join/), prompt for name if not set
    if (window.location.pathname.startsWith('/join/') && !localPlayerName) {
      let name = '';
      while (!name) {
        name = window.prompt('Enter your player name:') || '';
      }
      setLocalPlayerName(name);
      localStorage.setItem('catanPlayerName', name);
    }
  }, [localPlayerName]);

  async function handlePlayerSelect(num: number) {
    // Prompt for local IP address
    let ip = window.prompt('Enter your local IP address (e.g., 192.168.1.42):');
     if (!ip || !/^[0-9]{1,3}(\.[0-9]{1,3}){3}$/.test(ip)) {
      alert('Invalid IP address. Please try again.');
      return;
    }
    setLocalIp(ip);
    // Generate a simple random gameId
    const id = Math.random().toString(36).substring(2, 8);
    setSelectedPlayers(num);
    setGameId(id);
     // Initialize lobby in Firebase for MatchUp
     if (currentGame === 'matchup') {
       await set(ref(db, `matchup-lobbies/${id}`), { players: [], max: num, phase: 'lobby' });
     } else {
       await set(ref(db, `lobbies/${id}`), { players: [], max: num });
     }
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function handleStartGame() {
    setGameStarted(true);
    setPlacementPhase('setup');
    setClaimedSpots([]);
    setPlacementCount(0);
    // Shuffle player order and store in Firebase
    if (gameId && players.length > 0) {
      const order = shuffle(players);
      set(ref(db, `lobbies/${gameId}/playerOrder`), order);
      set(ref(db, `lobbies/${gameId}/placement`), {
        claimedSpots: [],
        placementPhase: 'setup',
        placementCount: 0,
      });
    }

    // If this is a MatchUp game, set the phase in matchup-lobbies to 'starting' for /join/:gameId clients
    if (currentGame === 'matchup' && gameId) {
      await update(ref(db, `matchup-lobbies/${gameId}`), { phase: 'starting' });
    }
  }

  // Snake draft order for initial placement (forward then reverse)
  function getPlacementPlayerIdx(count: number, numPlayers: number) {
    // Each player places 2 houses/roads: 0..N-1, N-1..0
    if (count < numPlayers) return count;
    return 2 * numPlayers - 1 - count;
  }
  // Use playerOrder for snake draft if available
  const draftOrder = playerOrder.length === players.length ? playerOrder : players;

  // Listen for placement state changes in Firebase
  useEffect(() => {
    if (!gameId) return;
    const placementRef = ref(db, `lobbies/${gameId}/placement`);
    const unsubscribe = onValue(placementRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setClaimedSpots(val.claimedSpots || []);
        setPlacementPhase(val.placementPhase || 'setup');
        setPlacementCount(val.placementCount || 0);
      }
    });
    return () => unsubscribe();
  }, [gameId]);

  // Handler for when a house/road is placed
  // Only allow the player whose turn it is to place, and only from their device
  function handlePlaceSpot(type: 'house' | 'road', id: number) {
    if (placementPhase !== 'setup' || !gameId) return;
    const numPlayers = players.length;
    const currentPlayerIdx = getPlacementPlayerIdx(placementCount, numPlayers);
    // Only allow if this device's player is the current player
    if (!localPlayerName || players[currentPlayerIdx] !== localPlayerName) return;
    if (claimedSpots.some(s => s.type === type && s.id === id)) return;
    const placementRef = ref(db, `lobbies/${gameId}/placement`);
    runTransaction(placementRef, (current) => {
      if (!current) return null;
      const { claimedSpots: cs = [], placementCount: pc = 0, placementPhase: pp = 'setup' } = current;
      if (pp !== 'setup') return current;
      if (cs.some((s: any) => s.type === type && s.id === id)) return current;
      const nextCount = pc + 1;
      return {
        claimedSpots: [...cs, { type, id, player: currentPlayerIdx }],
        placementCount: nextCount,
        placementPhase: nextCount >= numPlayers * 2 ? 'done' : 'setup',
      };
    });
  }

  // Build join URL using local IP if available
  const joinUrl = gameId && localIp ? `http://${localIp}:5173/join/${gameId}` : '';

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(ellipse at top, #f5e9c6 0%, #bfa76a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'UnifrakturCook, serif',
      overflow: 'hidden',
    }}>
      <h1 style={{
        fontSize: '2.8rem',
        color: '#6b3e26',
        textShadow: '0 2px 12px #fff8, 0 1px 0 #bfa76a',
        marginTop: 0,
        marginBottom: 0,
        letterSpacing: '0.08em',
        textAlign: 'center',
        fontFamily: 'UnifrakturCook, serif',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: 'rgba(245,233,198,0.85)',
        padding: '0.5em 0',
        borderBottom: '2px solid #bfa76a',
      }}>
        Cooler Catan
      </h1>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        minHeight: 0,
      }}>
        {!gameStarted && (
          <>
            {!showPlayerSelect && !selectedPlayers && !gameId && (
              <Button
                style={{
                  fontSize: '1.5rem',
                  padding: '0.75em 2.5em',
                  marginBottom: '2.5vh',
                  background: 'linear-gradient(90deg, #bfa76a 0%, #e2c275 100%)',
                  color: '#6b3e26',
                  border: '2px solid #6b3e26',
                  borderRadius: '1.5em',
                  fontFamily: 'UnifrakturCook, serif',
                  fontWeight: 700,
                  boxShadow: '0 4px 24px #bfa76a88',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setShowPlayerSelect(true)}
              >
                Play
              </Button>
            )}
            {showPlayerSelect && !selectedPlayers && !gameId && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '2vh', fontSize: '1.3rem', color: '#6b3e26', fontWeight: 700, fontFamily: 'UnifrakturCook, serif' }}>
                  Select Number of Players
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2em', justifyContent: 'center' }}>
                  {[2,3,4,5,6,7,8].map(num => (
                    <Button
                      key={num}
                      style={{
                        fontSize: '1.2rem',
                        padding: '0.5em 1.5em',
                        background: 'linear-gradient(90deg, #bfa76a 0%, #e2c275 100%)',
                        color: '#6b3e26',
                        border: '2px solid #6b3e26',
                        borderRadius: '1.2em',
                        fontFamily: 'UnifrakturCook, serif',
                        fontWeight: 700,
                        boxShadow: '0 2px 12px #bfa76a55',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => handlePlayerSelect(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {selectedPlayers && gameId && (
              <>
                <QRCodeDisplay url={joinUrl} />
                <div style={{ color: '#6b3e26', fontSize: 22, marginBottom: 16, fontFamily: 'UnifrakturCook, serif' }}>
                  Waiting for players to join...
                </div>
                <div style={{ color: '#6b3e26', fontSize: 18, marginBottom: 24, fontFamily: 'UnifrakturCook, serif' }}>
                  Players joined: <b>{playerCount} / {selectedPlayers}</b>
                </div>
                <Button
                  style={{
                    fontSize: '1.2rem',
                    padding: '0.5em 2em',
                    background: 'linear-gradient(90deg, #e2c275 0%, #bfa76a 100%)',
                    color: '#6b3e26',
                    border: '2px solid #6b3e26',
                    borderRadius: '1.5em',
                    fontFamily: 'UnifrakturCook, serif',
                    fontWeight: 700,
                    boxShadow: '0 2px 12px #bfa76a55',
                    letterSpacing: '0.05em',
                    cursor: playerCount < selectedPlayers ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '2vh',
                    opacity: playerCount < selectedPlayers ? 0.5 : 1,
                  }}
                  onClick={handleStartGame}
                  disabled={playerCount < selectedPlayers}
                >
                  Start Game
                </Button>
              </>
            )}
            <Button
              style={{
                fontSize: '1.2rem',
                padding: '0.5em 2em',
                background: 'linear-gradient(90deg, #e2c275 0%, #bfa76a 100%)',
                color: '#6b3e26',
                border: '2px solid #6b3e26',
                borderRadius: '1.5em',
                fontFamily: 'UnifrakturCook, serif',
                fontWeight: 700,
                boxShadow: '0 2px 12px #bfa76a55',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '2vh',
              }}
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
          </>
        )}
        {gameStarted && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            {!boardChoice && (
              <>
                <div style={{ fontFamily: 'UnifrakturCook, serif', fontSize: 32, color: '#6b3e26', marginBottom: 24 }}>
                  Choose Board Size
                </div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                  <Button
                    style={{ fontSize: 24, padding: '1em 2em', borderRadius: 24, background: 'linear-gradient(90deg, #f5e9c6 0%, #bfa76a 100%)', color: '#6b3e26', border: '2px solid #6b3e26', fontFamily: 'UnifrakturCook, serif', fontWeight: 700, boxShadow: '0 2px 12px #bfa76a55', letterSpacing: '0.05em', cursor: 'pointer' }}
                    onClick={() => {}}
                  >
                    Custom Board (coming soon)
                  </Button>
                  <Button
                    style={{ fontSize: 24, padding: '1em 2em', borderRadius: 24, background: 'linear-gradient(90deg, #f5e9c6 0%, #bfa76a 100%)', color: '#6b3e26', border: '2px solid #6b3e26', fontFamily: 'UnifrakturCook, serif', fontWeight: 700, boxShadow: '0 2px 12px #bfa76a55', letterSpacing: '0.05em', cursor: 'pointer' }}
                    onClick={() => setBoardChoice('19')}
                  >
                    Classic (19 tiles)
                  </Button>
                  <Button
                    style={{ fontSize: 24, padding: '1em 2em', borderRadius: 24, background: 'linear-gradient(90deg, #f5e9c6 0%, #bfa76a 100%)', color: '#6b3e26', border: '2px solid #6b3e26', fontFamily: 'UnifrakturCook, serif', fontWeight: 700, boxShadow: '0 2px 12px #bfa76a55', letterSpacing: '0.05em', cursor: 'pointer' }}
                    onClick={() => setBoardChoice('30')}
                  >
                    XL (30 tiles)
                  </Button>
                </div>
              </>
            )}
            {boardChoice && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Placement phase UI */}
                {placementPhase === 'setup' && (
                  <div style={{ fontFamily: 'UnifrakturCook, serif', fontSize: 28, color: '#6b3e26', marginBottom: 16 }}>
                    {draftOrder.length > 0 && (
                      <>
                        {localPlayerName && draftOrder[getPlacementPlayerIdx(placementCount, draftOrder.length)] === localPlayerName ? (
                          <>
                            <span style={{ color: '#232526', fontWeight: 700 }}>Your turn!</span> Place a {placementCount % 2 === 0 ? 'house' : 'road'}
                          </>
                        ) : (
                          <>
                            <span style={{ color: '#232526', fontWeight: 700 }}>{draftOrder[getPlacementPlayerIdx(placementCount, draftOrder.length)]}</span>
                            {' '}is placing a {placementCount % 2 === 0 ? 'house' : 'road'}...
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
                {/* Board is always view-only */}
                <HexBoard
                  tileCount={boardChoice === '19' ? 19 : 30}
                  players={draftOrder}
                  claimedSpots={claimedSpots}
                  placementPhase={placementPhase}
                  currentPlayerIdx={getPlacementPlayerIdx(placementCount, draftOrder.length)}
                  onPlaceSpot={undefined} // disables board interaction
                />
                {/* Player selection UI for their turn */}
                {placementPhase === 'setup' && localPlayerName && draftOrder[getPlacementPlayerIdx(placementCount, draftOrder.length)] === localPlayerName && (
                  <PlayerPlacementSelector
                    claimedSpots={claimedSpots}
                    type={placementCount % 2 === 0 ? 'house' : 'road'}
                    onSelect={(id) => handlePlaceSpot(placementCount % 2 === 0 ? 'house' : 'road', id)}
                    boardSize={boardChoice === '19' ? 19 : 30}
                  />
                )}
              </div>
            )}

          </div>
        )}
      </div>
      {/* Medieval font import */}
      <link href="https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap" rel="stylesheet" />
    </div>
  );
};
