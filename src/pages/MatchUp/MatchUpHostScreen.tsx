import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { ref, onValue, runTransaction } from 'firebase/database';
import { Button } from '../Common/Button';

type MatchUpLobby = {
  players: string[];
  max: number;
  phase?: string;
  readyPlayers?: string[];
  currentRound?: number;
};

const MatchUpHostScreen: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<MatchUpLobby | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for game data changes
  useEffect(() => {
    if (!gameId) return;
    const gameRef = ref(db, `matchup-lobbies/${gameId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameData(data);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [gameId]);

  const handleRoundSelect = async (roundNumber: number) => {
    if (!gameId) return;
    
    // Store selected round in Firebase
    await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
      if (!currentData) return currentData;
      return { ...currentData, currentRound: roundNumber };
    });
    
    // Navigate to round-specific host view
    navigate(`/game/matchup/${gameId}/host/round/${roundNumber}`);
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
        fontFamily: 'Orbitron, sans-serif'
      }}>
        <div style={{ color: '#f3e8ff', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Loading...</div>
      </div>
    );
  }

  // Show player list with purple gradient background when game starts
  const allPlayersReady = gameData && gameData.readyPlayers && gameData.players && 
    gameData.readyPlayers.length === gameData.players.length;

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
      padding: '2rem'
    }}>
      {allPlayersReady ? (
        // Show round selection when all players are ready
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#f3e8ff',
            textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
            marginBottom: '3rem',
            letterSpacing: '0.08em',
            textAlign: 'center',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase'
          }}>
            Select Round to Start
          </h1>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            {[1, 2, 3, 4, 5].map((roundNum) => (
              <Button
                key={roundNum}
                style={{
                  fontSize: '2rem',
                  padding: '1rem 2rem',
                  background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
                  color: '#f3e8ff',
                  border: '2px solid #f3e8ff',
                  borderRadius: '1.5rem',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 24px #a855f788',
                  transition: 'all 0.2s',
                  minWidth: '100px'
                }}
                onClick={() => handleRoundSelect(roundNum)}
              >
                Round {roundNum}
              </Button>
            ))}
          </div>
          
          <div style={{
            color: '#c084fc',
            fontSize: '1.2rem',
            textAlign: 'center',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            All players are ready!
          </div>
        </div>
      ) : (
        // Show player list in the middle of screen
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#f3e8ff',
            textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
            marginBottom: '3rem',
            letterSpacing: '0.08em',
            textAlign: 'center',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase'
          }}>
            Match Up Players
          </h1>
          
          <div style={{
            background: 'rgba(139, 92, 246, 0.15)',
            border: '2px solid #a855f7',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            width: '100%',
            maxWidth: '500px'
          }}>
            <div style={{
              color: '#f3e8ff',
              fontSize: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              Players: {gameData?.players?.length || 0} / {gameData?.max || 0}
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}>
              {gameData?.players?.map((player, index) => (
                <div key={index} style={{
                  color: '#f3e8ff',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid #c084fc',
                  borderRadius: '0.75rem',
                  width: '100%',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{player}</span>
                  {gameData.readyPlayers?.includes(player) ? (
                    <span style={{ color: '#10b981', fontSize: '1rem' }}>✓ Ready</span>
                  ) : (
                    <span style={{ color: '#f59e0b', fontSize: '1rem' }}>⏳ Waiting</span>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{
              color: '#c084fc',
              fontSize: '1.1rem',
              marginTop: '2rem',
              textAlign: 'center',
              fontWeight: 700
            }}>
              Waiting for all players to ready up...
            </div>
          </div>
        </div>
      )}
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
    </div>
  );
};

export default MatchUpHostScreen;
