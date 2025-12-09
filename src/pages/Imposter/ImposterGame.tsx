import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Player {
  id: number;
  name: string;
  hasRevealed: boolean;
  isImposter: boolean;
}

type GamePhase = 'setup' | 'playing' | 'results';

// Categories mapped to Datamuse API topics
const CATEGORIES = [
  { name: 'Movies', topic: 'film' },
  { name: 'Objects', topic: 'tool' },
  { name: 'Sports', topic: 'sport' },
  { name: 'Foods', topic: 'food' },
  { name: 'Animals', topic: 'animal' },
  { name: 'Jobs', topic: 'occupation' },
  { name: 'Brands', topic: 'company' },
  { name: 'Vehicles', topic: 'vehicle' },
  { name: 'Countries', topic: 'country' }
];

// Fallback words in case Datamuse API fails
const FALLBACK_WORDS: Record<string, string[]> = {
  film: ['Inception', 'Avatar', 'Titanic', 'Jaws', 'Frozen', 'Shrek', 'Matrix', 'Gladiator', 'Interstellar'],
  tool: ['Umbrella', 'Telescope', 'Compass', 'Hourglass', 'Scissors', 'Stapler', 'Hammer', 'Wrench'],
  sport: ['Basketball', 'Swimming', 'Tennis', 'Archery', 'Fencing', 'Cycling', 'Hockey', 'Volleyball'],
  food: ['Pizza', 'Sushi', 'Tacos', 'Curry', 'Waffles', 'Ramen', 'Lasagna', 'Burger', 'Pasta'],
  animal: ['Penguin', 'Dolphin', 'Elephant', 'Giraffe', 'Koala', 'Octopus', 'Tiger', 'Panda'],
  occupation: ['Astronaut', 'Chef', 'Detective', 'Architect', 'Surgeon', 'Pilot', 'Teacher', 'Engineer'],
  company: ['Nike', 'Apple', 'Tesla', 'Sony', 'Adidas', 'Samsung', 'Netflix', 'Microsoft', 'Google'],
  vehicle: ['Bicycle', 'Motorcycle', 'Helicopter', 'Submarine', 'Truck', 'Train', 'Yacht', 'Scooter'],
  country: ['Japan', 'Brazil', 'Norway', 'Egypt', 'Australia', 'Canada', 'India', 'France', 'Mexico']
};

export const ImposterGame: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', hasRevealed: false, isImposter: false },
    { id: 2, name: 'Player 2', hasRevealed: false, isImposter: false },
    { id: 3, name: 'Player 3', hasRevealed: false, isImposter: false }
  ]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [gameType, setGameType] = useState('default');
  const [secretWord, setSecretWord] = useState('');
  const [category, setCategory] = useState('');
  const [imposterIndex, setImposterIndex] = useState(-1);
  
  const [holdingPlayerId, setHoldingPlayerId] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showReveal, setShowReveal] = useState<{ playerId: number; isImposter: boolean; word?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);

  const addPlayer = () => {
    const newId = Math.max(...players.map(p => p.id), 0) + 1;
    setPlayers([...players, { 
      id: newId, 
      name: `Player ${newId}`, 
      hasRevealed: false,
      isImposter: false 
    }]);
  };

  const removePlayer = () => {
    if (players.length > 3) {
      setPlayers(players.slice(0, -1));
    }
  };

  const updatePlayerName = (id: number, newName: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const getRandomWord = async (topic: string): Promise<string> => {
    try {
      // Datamuse API - completely free, no authentication required
      const response = await fetch(
        `https://api.datamuse.com/words?topics=${topic}&max=100`
      );

      if (!response.ok) {
        throw new Error('Datamuse API request failed');
      }

      const data = await response.json();
      
      // Filter for words that are 1-2 words and not too obscure
      const validWords = data.filter((item: { word: string; score?: number }) => {
        const wordCount = item.word.split(' ').length;
        return wordCount <= 2 && item.word.length <= 20;
      });

      if (validWords.length === 0) {
        throw new Error('No valid words found');
      }

      // Select random word from results
      const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
      
      // Capitalize first letter of each word
      return randomWord.word
        .split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } catch (error) {
      console.error('Datamuse API error, using fallback:', error);
      const words = FALLBACK_WORDS[topic] || FALLBACK_WORDS.tool;
      return words[Math.floor(Math.random() * words.length)];
    }
  };

  const startGame = async () => {
    if (players.length < 3) {
      alert('You need at least 3 players to start!');
      return;
    }

    setIsLoading(true);
    
    // Select random category
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setCategory(randomCategory.name);
    
    // Get random word using category topic
    const word = await getRandomWord(randomCategory.topic);
    setSecretWord(word);
    
    // Select random imposter
    const randomImposterIndex = Math.floor(Math.random() * players.length);
    setImposterIndex(randomImposterIndex);
    
    // Update players with imposter status
    const updatedPlayers = players.map((p, idx) => ({
      ...p,
      isImposter: idx === randomImposterIndex,
      hasRevealed: false
    }));
    setPlayers(updatedPlayers);
    
    setIsLoading(false);
    setGamePhase('playing');
  };

  const handleMouseDown = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player || player.hasRevealed) return;

    setHoldingPlayerId(playerId);
    holdStartRef.current = Date.now();

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min((elapsed / 1500) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        handleReveal(playerId);
      }
    }, 16);
  };

  const handleMouseUp = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldingPlayerId(null);
    setHoldProgress(0);
  };

  const handleReveal = (playerId: number) => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    setShowReveal({
      playerId,
      isImposter: player.isImposter,
      word: player.isImposter ? undefined : secretWord
    });

    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, hasRevealed: true } : p
    ));

    setHoldingPlayerId(null);
    setHoldProgress(0);
  };

  const closeReveal = () => {
    setShowReveal(null);
  };

  const showResults = () => {
    setGamePhase('results');
  };

  const backToMenu = () => {
    setGamePhase('setup');
    setSecretWord('');
    setCategory('');
    setImposterIndex(-1);
    setShowReveal(null);
    // Keep player names but reset their revealed status
    setPlayers(players.map(p => ({ ...p, hasRevealed: false, isImposter: false })));
  };

  const backToHome = () => {
    navigate('/');
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a00 100%)',
      color: '#FFD700',
      padding: '2rem',
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      position: 'relative'
    }}>
      {/* Return to Home Button - Always visible */}
      <button
        onClick={backToHome}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          background: 'rgba(255, 215, 0, 0.1)',
          border: '2px solid #FFD700',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          color: '#FFD700',
          fontSize: '1rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ← Home
      </button>

      {/* Setup Phase */}
      {gamePhase === 'setup' && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          paddingTop: '4rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '0.5rem',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
          }}>
            IMPOSTER
          </h1>
          <p style={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#CCA300',
            marginBottom: '3rem'
          }}>
            Interactive social deduction game using AI-generated content
          </p>

          {/* Players Section */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.05)',
            border: '2px solid #FFD700',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0
              }}>
                Players ({players.length})
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={removePlayer}
                  disabled={players.length <= 3}
                  style={{
                    background: players.length <= 3 ? 'rgba(128, 128, 128, 0.3)' : 'rgba(255, 50, 50, 0.2)',
                    border: players.length <= 3 ? '2px solid #666' : '2px solid #FF3232',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    color: players.length <= 3 ? '#666' : '#FF3232',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: players.length <= 3 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: players.length <= 3 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (players.length > 3) {
                      e.currentTarget.style.background = 'rgba(255, 50, 50, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (players.length > 3) {
                      e.currentTarget.style.background = 'rgba(255, 50, 50, 0.2)';
                    }
                  }}
                >
                  −
                </button>
                <button
                  onClick={addPlayer}
                  style={{
                    background: 'rgba(255, 215, 0, 0.2)',
                    border: '2px solid #FFD700',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    color: '#FFD700',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {players.map((player) => (
                <input
                  key={player.id}
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayerName(player.id, e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '2px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#FFD700',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FFD700';
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                    e.currentTarget.select();
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                  }}
                />
              ))}
            </div>
          </div>

          {/* Game Type Section */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.05)',
            border: '2px solid #FFD700',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Game Type
            </h2>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                color: '#FFD700',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="default">Default</option>
            </select>
          </div>

          {/* Start Game Button */}
          <button
            onClick={startGame}
            disabled={isLoading}
            style={{
              width: '100%',
              background: isLoading ? 'rgba(128, 128, 128, 0.3)' : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#000',
              fontSize: '1.5rem',
              fontWeight: '700',
              cursor: isLoading ? 'wait' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 215, 0, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 215, 0, 0.3)';
              }
            }}
          >
            {isLoading ? 'Generating Game...' : 'Start Game'}
          </button>
        </div>
      )}

      {/* Playing Phase */}
      {gamePhase === 'playing' && (
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          paddingTop: '4rem'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '500',
              color: '#CCA300',
              marginBottom: '0.5rem'
            }}>
              Category: {category.toUpperCase()}
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#999',
              fontStyle: 'italic'
            }}>
              Hold player name for 1.5 seconds to reveal
            </p>
          </div>

          {/* Player Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {players.map((player) => (
              <div
                key={player.id}
                onMouseDown={() => handleMouseDown(player.id)}
                onMouseUp={handleMouseUp}
                onMouseLeave={(e) => {
                  handleMouseUp();
                  if (!player.hasRevealed) {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                onTouchStart={() => handleMouseDown(player.id)}
                onTouchEnd={handleMouseUp}
                style={{
                  background: player.hasRevealed 
                    ? 'rgba(128, 128, 128, 0.2)' 
                    : 'rgba(255, 215, 0, 0.1)',
                  border: `3px solid ${player.hasRevealed ? '#666' : '#FFD700'}`,
                  borderRadius: '16px',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  cursor: player.hasRevealed ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  opacity: player.hasRevealed ? 0.5 : 1
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  if (!player.hasRevealed) {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
              >
                {/* Progress Bar */}
                {holdingPlayerId === player.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '6px',
                    width: `${holdProgress}%`,
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    transition: 'width 0.016s linear',
                    borderRadius: '0 0 0 12px'
                  }} />
                )}
                
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  margin: 0,
                  color: player.hasRevealed ? '#666' : '#FFD700',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}>
                  {player.name}
                </h3>
              </div>
            ))}
          </div>

          {/* Reveal Results Button */}
          <button
            onClick={showResults}
            style={{
              width: '100%',
              maxWidth: '400px',
              display: 'block',
              margin: '0 auto',
              background: 'rgba(255, 50, 50, 0.2)',
              border: '2px solid #FF3232',
              borderRadius: '12px',
              padding: '1.25rem',
              color: '#FF3232',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 50, 50, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 50, 50, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Game Over - Reveal Results
          </button>
        </div>
      )}

      {/* Results Phase */}
      {gamePhase === 'results' && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          paddingTop: '6rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '2rem',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
          }}>
            Game Over!
          </h1>

          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '3px solid #FFD700',
            borderRadius: '16px',
            padding: '3rem 2rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                color: '#CCA300',
                marginBottom: '0.5rem'
              }}>
                The Imposter Was:
              </h2>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#FF3232',
                margin: '0'
              }}>
                {players[imposterIndex]?.name}
              </p>
            </div>

            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '500',
                color: '#CCA300',
                marginBottom: '0.5rem'
              }}>
                The Secret Word Was:
              </h2>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#FFD700',
                margin: '0'
              }}>
                {secretWord}
              </p>
            </div>
          </div>

          <button
            onClick={backToMenu}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '1.5rem',
              color: '#000',
              fontSize: '1.3rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 215, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 215, 0, 0.3)';
            }}
          >
            Back to Main Menu
          </button>
        </div>
      )}

      {/* Reveal Popup */}
      {showReveal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a00 0%, #000000 100%)',
            border: `4px solid ${showReveal.isImposter ? '#FF3232' : '#FFD700'}`,
            borderRadius: '24px',
            padding: '3rem 2rem',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            position: 'relative',
            boxShadow: `0 20px 60px ${showReveal.isImposter ? 'rgba(255, 50, 50, 0.5)' : 'rgba(255, 215, 0, 0.5)'}`,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTouchCallout: 'none'
          } as React.CSSProperties}>
            <button
              onClick={closeReveal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ×
            </button>

            {showReveal.isImposter ? (
              <>
                <h2 style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#FF3232',
                  marginBottom: '1rem',
                  textShadow: '0 0 20px rgba(255, 50, 50, 0.7)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}>
                  IMPOSTER
                </h2>
                <p style={{
                  fontSize: '1.2rem',
                  color: '#CCA300',
                  marginTop: '1rem',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}>
                  Try to blend in without knowing the secret word!
                </p>
              </>
            ) : (
              <>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: '#CCA300',
                  marginBottom: '1rem',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}>
                  Your Secret Word:
                </h2>
                <p style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#FFD700',
                  margin: '1rem 0',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.7)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}>
                  {showReveal.word}
                </p>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#999',
                  marginTop: '1.5rem',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                } as React.CSSProperties}>
                  Find the imposter who doesn't know this word!
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
