import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { ref, onValue, set, runTransaction } from 'firebase/database';
import { Button } from '../Common/Button';
import { useGameContext } from '../../contexts/GameContext';
import { QRCodeDisplay } from '../Common/QRCodeDisplay';

const MatchUpEntry: React.FC = () => {
  const navigate = useNavigate();
  const { currentGame, enterGame } = useGameContext();
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<string[]>([]);
  const [localIp, setLocalIp] = useState<string | null>(null);

  // Set the current game to 'matchup' when entering MatchUpEntry
  useEffect(() => {
    if (currentGame !== 'matchup') {
      enterGame('matchup');
    }
  }, [currentGame, enterGame]);

  // Listen for player list changes in Firebase (MatchUp lobby)
  useEffect(() => {
    if (!gameId) return;
    const playersRef = ref(db, `matchup-lobbies/${gameId}/players`);
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
    return () => unsubPlayers();
  }, [gameId]);

  // Example: handle player select
  async function handlePlayerSelect(num: number) {
    // Prompt for local IP address like Catan does
    let ip = window.prompt('Enter your local IP address (e.g., 192.168.1.42):');
    if (!ip || !/^[0-9]{1,3}(\.[0-9]{1,3}){3}$/.test(ip)) {
      alert('Invalid IP address. Please try again.');
      return;
    }
    setLocalIp(ip);
    setSelectedPlayers(num);
    // Generate a new gameId (could use timestamp or random string)
    const newGameId = Math.random().toString(36).substr(2, 8);
    setGameId(newGameId);
    // Initialize lobby in Firebase for MatchUp, always include players: []
    await set(ref(db, `matchup-lobbies/${newGameId}`), {
      players: [],
      max: num,
      phase: 'lobby'
    });
  }

  async function handleStartGame() {
    if (gameId && players.length > 0) {
      // Set phase to 'starting' first to show purple gradient on join screens
      await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
        if (!currentData) return currentData;
        return { ...currentData, phase: 'starting' };
      });
      // After a short delay, set to ready-check so players can proceed to game
      setTimeout(async () => {
        await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
          if (!currentData) return currentData;
          return { ...currentData, phase: 'ready-check' };
        });
      }, 2000); // 2 second delay
      navigate(`/game/matchup/${gameId}/host`);
    }
  }

  // Remove the automatic IP setting, rely on user input
  // useEffect(() => {
  //   setLocalIp(window.location.hostname);
  // }, []);

  const joinUrl = gameId && localIp ? `http://${localIp}:5173/join/${gameId}` : '';

  return (
  <div style={{
              minHeight: '100vh',
              width: '100vw',
              background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: 'Orbitron, sans-serif',
              overflow: 'hidden',
            }}>
              <h1 style={{
                fontSize: '2.8rem',
                color: '#f3e8ff',
                textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
                marginTop: 0,
                marginBottom: 0,
                letterSpacing: '0.08em',
                textAlign: 'center',
                fontFamily: 'Orbitron, sans-serif',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                background: 'rgba(88,28,135,0.85)',
                padding: '0.5em 0',
                borderBottom: '2px solid #a855f7',
                textTransform: 'uppercase',
              }}>
                Match Up
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
                {!showPlayerSelect && !selectedPlayers && !gameId && (
                  <Button
                    style={{
                      fontSize: '1.5rem',
                      padding: '0.75em 2.5em',
                      marginBottom: '2.5vh',
                      background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
                      color: '#f3e8ff',
                      border: '2px solid #f3e8ff',
                      borderRadius: '1.5em',
                      fontFamily: 'Orbitron, sans-serif',
                      fontWeight: 800,
                      boxShadow: '0 4px 24px #a855f788',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                    }}
                    onClick={() => setShowPlayerSelect(true)}
                  >
                    Play
                  </Button>
                )}
                {showPlayerSelect && !selectedPlayers && !gameId && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '2vh', fontSize: '1.3rem', color: '#f3e8ff', fontWeight: 800, fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Select Number of Players
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2em', justifyContent: 'center' }}>
                      {[1,3,4,5,6,7,8,9,10,11,12].map(num => (
                        <Button
                          key={num}
                          style={{
                            fontSize: '1.2rem',
                            padding: '0.5em 1.5em',
                            background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
                            color: '#f3e8ff',
                            border: '2px solid #f3e8ff',
                            borderRadius: '1.2em',
                            fontFamily: 'Orbitron, sans-serif',
                            fontWeight: 800,
                            boxShadow: '0 2px 12px #a855f755',
                            letterSpacing: '0.08em',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase',
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
                    <div style={{ color: '#f3e8ff', fontSize: 22, marginBottom: 16, fontFamily: 'Orbitron, sans-serif', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Waiting for players to join...
                    </div>
                    <div style={{ color: '#f3e8ff', fontSize: 18, marginBottom: 24, fontFamily: 'Orbitron, sans-serif', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Players joined: <b>{playerCount} / {selectedPlayers}</b>
                    </div>
                    <Button
                      style={{
                        fontSize: '1.2rem',
                        padding: '0.5em 2em',
                        background: 'linear-gradient(90deg, #c084fc 0%, #a855f7 100%)',
                        color: '#f3e8ff',
                        border: '2px solid #f3e8ff',
                        borderRadius: '1.5em',
                        fontFamily: 'Orbitron, sans-serif',
                        fontWeight: 800,
                        boxShadow: '0 2px 12px #a855f755',
                        letterSpacing: '0.08em',
                        cursor: playerCount < selectedPlayers ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '2vh',
                        opacity: playerCount < selectedPlayers ? 0.5 : 1,
                        textTransform: 'uppercase',
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
                    background: 'linear-gradient(90deg, #c084fc 0%, #a855f7 100%)',
                    color: '#f3e8ff',
                    border: '2px solid #f3e8ff',
                    borderRadius: '1.5em',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 800,
                    boxShadow: '0 2px 12px #a855f755',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginTop: '2vh',
                    textTransform: 'uppercase',
                  }}
                  onClick={() => navigate('/')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          );
}

export default MatchUpEntry;
