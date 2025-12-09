
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { ref, onValue, runTransaction } from 'firebase/database';
import { Button } from '../Common/Button';
import { ROUND_2_PROMPTS } from './MatchUpRoundView';

type MatchUpLobby = {
  players: string[];
  max: number;
  phase?: string;
  readyPlayers?: string[];
  currentRound?: number;
  round1?: {
    currentMatchup: number;
    player1: string;
    player2: string;
    question: string;
    votes: Record<string, string>;
    voteCounts: { player1: number; player2: number };
    showResults: boolean;
    completed: boolean;
  };
  round2?: {
    currentPlayer: string;
    currentPrompt: string;
    isActive: boolean;
    previousPlayer?: string;
  };
  round3?: {
    phase: 'writing' | 'voting' | 'results' | 'complete';
    currentMatchup: number;
    totalMatchups: number;
    timeRemaining: number;
    playerPrompts: Record<string, string[]>;
    playerAnswers: Record<string, string[]>;
    matchups: Array<{
      prompt: string;
      player1: string;
      player2: string;
      answer1: string;
      answer2: string;
      votes: Record<string, string>;
      voteCounts: { player1: number; player2: number };
      winner?: string;
      voterDetails?: Record<string, string>;
    }>;
    scores: Record<string, number>;
  };
};

const MatchUpPlayer: React.FC = () => {
  const { gameId, playerName } = useParams<{ gameId: string; playerName: string }>();
  const [gameData, setGameData] = useState<MatchUpLobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    if (!gameId || !playerName) return;
    
    const gameRef = ref(db, `matchup-lobbies/${gameId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Check if player is still in the game
        if (!data.players || !data.players.includes(playerName)) {
          setError('You are not in this game');
          return;
        }
        setGameData(data);
        setLoading(false);
        
        // Check if this player is ready
        setIsReady(data.readyPlayers?.includes(playerName) || false);
        
        // Check if all players are ready
        const allPlayersReady = data.readyPlayers && data.players && 
          data.readyPlayers.length === data.players.length;
        setAllReady(allPlayersReady || false);
      } else {
        setError('Game not found');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [gameId, playerName]);

  const handleReadyUp = async () => {
    if (!gameId || !playerName || isReady) return;
    
    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
        if (!currentData) return currentData;
        
        const readyPlayers = currentData.readyPlayers || [];
        if (!readyPlayers.includes(playerName)) {
          return {
            ...currentData,
            readyPlayers: [...readyPlayers, playerName]
          };
        }
        return currentData;
      });
    } catch (error) {
      console.error('Failed to ready up:', error);
    }
  };

  const handleVote = async (chosenPlayer: string) => {
    if (!gameId || !playerName || !gameData?.round1) return;
    
    // Don't allow voting if player is in the matchup
    if (playerName === gameData.round1.player1 || playerName === gameData.round1.player2) return;
    
    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}/round1`), (currentData) => {
        if (!currentData) return currentData;
        
        const votes = currentData.votes || {};
        const voteCounts = currentData.voteCounts || { player1: 0, player2: 0 };
        
        // Remove previous vote if exists
        if (votes[playerName]) {
          if (votes[playerName] === currentData.player1) {
            voteCounts.player1 = Math.max(0, voteCounts.player1 - 1);
          } else if (votes[playerName] === currentData.player2) {
            voteCounts.player2 = Math.max(0, voteCounts.player2 - 1);
          }
        }
        
        // Add new vote
        votes[playerName] = chosenPlayer;
        if (chosenPlayer === currentData.player1) {
          voteCounts.player1 = voteCounts.player1 + 1;
        } else if (chosenPlayer === currentData.player2) {
          voteCounts.player2 = voteCounts.player2 + 1;
        }
        
        return {
          ...currentData,
          votes,
          voteCounts
        };
      });
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleNextTurn = async () => {
    if (!gameId || !gameData?.round2 || !gameData.players) return;

    const previousPlayer = gameData.round2.currentPlayer;
    // Select next random player, avoiding immediate repeat
    let availablePlayers = gameData.players.filter(p => p !== previousPlayer);
    if (availablePlayers.length === 0) {
      availablePlayers = gameData.players; // Fallback if only one player
    }
    const nextPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    
  // Use shared prompts from MatchUpRoundView
  const nextPrompt = ROUND_2_PROMPTS[Math.floor(Math.random() * ROUND_2_PROMPTS.length)];

    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}/round2`), (current) => {
        if (!current) return current;
        return {
          ...current,
          currentPlayer: nextPlayer,
          currentPrompt: nextPrompt,
          previousPlayer: previousPlayer
        };
      });
    } catch (error) {
      console.error('Failed to move to next turn:', error);
    }
  };

  const handleAnswerChange = async (promptIndex: number, answer: string) => {
    if (!gameId || !playerName || !gameData?.round3) return;

    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}/round3/playerAnswers/${playerName}`), (currentAnswers) => {
        const answers = currentAnswers || ['', '', ''];
        answers[promptIndex] = answer;
        return answers;
      });
    } catch (error) {
      console.error('Failed to update answer:', error);
    }
  };

  const handleRound3Vote = async (chosenPlayer: string) => {
    if (!gameId || !playerName || !gameData?.round3) return;
    
    const currentMatchup = gameData.round3.currentMatchup;
    
    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}/round3/matchups/${currentMatchup}`), (current) => {
        if (!current) return current;
        
        const votes = current.votes || {};
        const voteCounts = current.voteCounts || { player1: 0, player2: 0 };
        
        // Remove previous vote if exists
        if (votes[playerName]) {
          if (votes[playerName] === current.player1) {
            voteCounts.player1 = Math.max(0, voteCounts.player1 - 1);
          } else if (votes[playerName] === current.player2) {
            voteCounts.player2 = Math.max(0, voteCounts.player2 - 1);
          }
        }
        
        // Add new vote
        votes[playerName] = chosenPlayer;
        if (chosenPlayer === current.player1) {
          voteCounts.player1 = voteCounts.player1 + 1;
        } else if (chosenPlayer === current.player2) {
          voteCounts.player2 = voteCounts.player2 + 1;
        }
        
        return {
          ...current,
          votes,
          voteCounts
        };
      });
    } catch (error) {
      console.error('Failed to vote in Round 3:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        <div style={{ color: '#dbeafe', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        <div style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2rem' }}>{error}</div>
      </div>
    );
  }

  // Check if Round 1 is active
  const isRound1Active = gameData?.currentRound === 1 && gameData.round1 && !gameData.round1.completed;
  const round1Data = gameData?.round1;

  // If Round 1 is starting but data isn't ready yet, show loading
  if (gameData?.currentRound === 1 && !round1Data) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#dbeafe',
          textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
          marginBottom: '2rem',
          letterSpacing: '0.08em',
          fontFamily: 'Orbitron, sans-serif',
          textTransform: 'uppercase'
        }}>
          Round 1 Starting...
        </h1>
        <div style={{ color: '#93c5fd', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase' }}>
          Please wait...
        </div>
      </div>
    );
  }

  // If Round 1 is active, show voting interface
  if (isRound1Active && round1Data && playerName) {
    const isPlayerInMatchup = playerName === round1Data.player1 || playerName === round1Data.player2;
    const votes = round1Data.votes || {};
    const hasVoted = votes[playerName] !== undefined;
    const playerVote = votes[playerName];
    
    const player1Votes = round1Data.voteCounts.player1;
    const player2Votes = round1Data.voteCounts.player2;
    const winner = player1Votes > player2Votes ? round1Data.player1 : 
                   player2Votes > player1Votes ? round1Data.player2 : null;

    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif',
        padding: '2rem'
      }}>
        {/* Round 1 voting interface */}
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#dbeafe',
            textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
            marginBottom: '1rem',
            letterSpacing: '0.08em',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase'
          }}>
            MATCH-UP
          </h1>
          
          <div style={{
            color: '#93c5fd',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Matchup {round1Data.currentMatchup} of 15
          </div>

          {/* Question */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid #3b82f6',
            borderRadius: '1.5rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.4rem',
              color: '#dbeafe',
              fontWeight: 800,
              textTransform: 'uppercase',
              margin: 0
            }}>
              {round1Data.question}
            </h2>
          </div>

          {isPlayerInMatchup ? (
            // Player is in the matchup - cannot vote
            <div style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '2px solid #3b82f6',
              borderRadius: '1.5rem',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                color: '#f59e0b',
                fontSize: '1.3rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                You're in this matchup!
              </div>
              <div style={{
                color: '#93c5fd',
                fontSize: '1.1rem',
                fontWeight: 700
              }}>
                {round1Data.showResults ? 'Results:' : 'Waiting for votes...'}
              </div>
              
              {round1Data.showResults && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  marginTop: '1.5rem',
                  gap: '2rem'
                }}>
                  <div style={{
                    color: winner === round1Data.player1 ? '#10b981' : '#dbeafe',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {round1Data.player1}: {player1Votes} votes
                  </div>
                  <div style={{
                    color: winner === round1Data.player2 ? '#10b981' : '#dbeafe',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {round1Data.player2}: {player2Votes} votes
                  </div>
                </div>
              )}
            </div>
          ) : round1Data.showResults ? (
            // Show results
            <div style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '2px solid #3b82f6',
              borderRadius: '1.5rem',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                color: '#10b981',
                fontSize: '1.3rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '1.5rem'
              }}>
                Results:
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                gap: '2rem'
              }}>
                <div style={{
                  color: winner === round1Data.player1 ? '#10b981' : '#dbeafe',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  {round1Data.player1}: {player1Votes} votes
                </div>
                <div style={{
                  color: winner === round1Data.player2 ? '#10b981' : '#dbeafe',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  {round1Data.player2}: {player2Votes} votes
                </div>
              </div>
              
              {playerVote && (
                <div style={{
                  color: '#93c5fd',
                  fontSize: '1rem',
                  marginTop: '1rem',
                  fontWeight: 700
                }}>
                  You voted for: {playerVote}
                </div>
              )}
            </div>
          ) : hasVoted ? (
            // Player has voted, waiting for results
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              borderRadius: '1.5rem',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                color: '#10b981',
                fontSize: '1.3rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                ✓ Vote Submitted!
              </div>
              <div style={{
                color: '#93c5fd',
                fontSize: '1.1rem',
                fontWeight: 700
              }}>
                You voted for: {playerVote}
              </div>
              <div style={{
                color: '#93c5fd',
                fontSize: '1rem',
                marginTop: '0.5rem',
                fontWeight: 700
              }}>
                Waiting for other players...
              </div>
            </div>
          ) : (
            // Show voting buttons
            <div style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '2px solid #3b82f6',
              borderRadius: '1.5rem',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                color: '#dbeafe',
                fontSize: '1.2rem',
                marginBottom: '2rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Vote for your choice:
              </div>
              
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <Button
                  style={{
                    fontSize: '1.3rem',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                    color: '#dbeafe',
                    border: '2px solid #dbeafe',
                    borderRadius: '1rem',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 24px #3b82f688',
                    flex: 1
                  }}
                  onClick={() => handleVote(round1Data.player1)}
                >
                  {round1Data.player1}
                </Button>
                
                <Button
                  style={{
                    fontSize: '1.3rem',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                    color: '#dbeafe',
                    border: '2px solid #dbeafe',
                    borderRadius: '1rem',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 24px #3b82f688',
                    flex: 1
                  }}
                  onClick={() => handleVote(round1Data.player2)}
                >
                  {round1Data.player2}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
      </div>
    );
  }

  // Check if Round 2 is active
  const isRound2Active = gameData?.currentRound === 2 && gameData.round2 && gameData.round2.isActive;
  const round2Data = gameData?.round2;

  // If Round 2 is starting but data isn't ready yet, show loading
  if (gameData?.currentRound === 2 && !round2Data) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#dbeafe',
          textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
          marginBottom: '2rem',
          letterSpacing: '0.08em',
          fontFamily: 'Orbitron, sans-serif',
          textTransform: 'uppercase'
        }}>
          Round 2 Starting...
        </h1>
        <div style={{ color: '#93c5fd', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase' }}>
          Please wait...
        </div>
      </div>
    );
  }

  // If Round 2 is active, show appropriate interface
  if (isRound2Active && round2Data && playerName) {
    const isCurrentPlayer = playerName === round2Data.currentPlayer;

    if (isCurrentPlayer) {
      // Show prompt for current player
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Orbitron, sans-serif',
          padding: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#dbeafe',
            textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
            marginBottom: '3rem',
            letterSpacing: '0.08em',
            textAlign: 'center',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase'
          }}>
            Your Turn!
          </h1>
          
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid #3b82f6',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            marginBottom: '3rem',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{
              color: '#dbeafe',
              fontSize: '1.3rem',
              fontWeight: 700,
              marginBottom: '2rem',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              {round2Data.currentPrompt}
            </div>
            
            <div style={{
              color: '#93c5fd',
              fontSize: '1.1rem',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Read this prompt aloud to the group, then click Next Turn when ready.
            </div>
          </div>

          <Button
            style={{
              fontSize: '1.5rem',
              padding: '1rem 3rem',
              background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
              color: '#dbeafe',
              border: '2px solid #dbeafe',
              borderRadius: '1.5rem',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '0 4px 24px #3b82f688'
            }}
            onClick={handleNextTurn}
          >
            Next Turn
          </Button>
          
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
        </div>
      );
    } else {
      // Show "You are not the Host" for other players
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Orbitron, sans-serif',
          padding: '2rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#dbeafe',
            textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
            marginBottom: '2rem',
            letterSpacing: '0.08em',
            textAlign: 'center',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase'
          }}>
            You are not the Host
          </h1>
          
          <div style={{
            color: '#93c5fd',
            fontSize: '1.5rem',
            fontWeight: 700,
            textAlign: 'center',
            textTransform: 'uppercase'
          }}>
            Wait for {round2Data.currentPlayer} to read their prompt
          </div>
          
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
        </div>
      );
    }
  }

  // Check if Round 3 is active
  const isRound3Active = gameData?.currentRound === 3 && gameData.round3;
  const round3Data = gameData?.round3;

  // If Round 3 is starting but data isn't ready yet, show loading
  if (gameData?.currentRound === 3 && !round3Data) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#dbeafe',
          textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
          marginBottom: '2rem',
          letterSpacing: '0.08em',
          fontFamily: 'Orbitron, sans-serif',
          textTransform: 'uppercase'
        }}>
          Round 3 Starting...
        </h1>
        <div style={{ color: '#93c5fd', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase' }}>
          Quiplash Mode Loading...
        </div>
      </div>
    );
  }

  // If Round 3 is active, show appropriate interface
  if (isRound3Active && round3Data && playerName) {
    const playerPrompts = round3Data.playerPrompts[playerName] || [];
    const playerAnswers = round3Data.playerAnswers[playerName] || ['', '', ''];

    // Writing Phase
    if (round3Data.phase === 'writing') {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Orbitron, sans-serif',
          padding: '2rem'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#dbeafe',
              textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
              marginBottom: '1rem',
              letterSpacing: '0.08em',
              fontFamily: 'Orbitron, sans-serif',
              textTransform: 'uppercase'
            }}>
              QUIPLASH
            </h1>
            
            {/* Timer */}
            <div style={{
              fontSize: '1.5rem',
              color: round3Data.timeRemaining <= 10 ? '#f87171' : '#10b981',
              fontWeight: 900,
              marginBottom: '0.5rem'
            }}>
              {Math.floor(round3Data.timeRemaining / 60)}:{(round3Data.timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div style={{
              color: '#93c5fd',
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              Write your jokes!
            </div>
          </div>

          {/* Prompts */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%'
          }}>
            {playerPrompts.map((prompt, index) => (
              <div key={index} style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '2px solid #3b82f6',
                borderRadius: '1rem',
                padding: '1.5rem'
              }}>
                <div style={{
                  color: '#dbeafe',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {prompt}
                </div>
                
                <textarea
                  value={playerAnswers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Write your funny answer here..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontFamily: 'Orbitron, sans-serif',
                    background: 'rgba(219, 234, 254, 0.1)',
                    border: '1px solid #93c5fd',
                    borderRadius: '0.5rem',
                    color: '#dbeafe',
                    resize: 'vertical'
                  }}
                />
              </div>
            ))}
          </div>
          
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
        </div>
      );
    }

    // Voting Phase (implementation coming next)
    if (round3Data.phase === 'voting') {
      const currentMatchup = round3Data.matchups[round3Data.currentMatchup];
      const canVote = playerName !== currentMatchup?.player1 && playerName !== currentMatchup?.player2;
      const hasVoted = currentMatchup?.votes?.[playerName!] !== undefined;
      const playerVote = currentMatchup?.votes?.[playerName!];

      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Orbitron, sans-serif',
          padding: '2rem'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#dbeafe',
              textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
              marginBottom: '1rem',
              letterSpacing: '0.08em',
              fontFamily: 'Orbitron, sans-serif',
              textTransform: 'uppercase'
            }}>
              VOTE
            </h1>
            
            {/* Timer */}
            <div style={{
              fontSize: '1.5rem',
              color: round3Data.timeRemaining <= 10 ? '#f87171' : '#10b981',
              fontWeight: 900,
              marginBottom: '0.5rem'
            }}>
              {Math.floor(round3Data.timeRemaining / 60)}:{(round3Data.timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div style={{
              color: '#93c5fd',
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              Matchup {round3Data.currentMatchup + 1} of {round3Data.totalMatchups}
            </div>
          </div>

          {currentMatchup && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '800px',
              margin: '0 auto',
              width: '100%'
            }}>
              {/* Prompt */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '2px solid #3b82f6',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                textAlign: 'center',
                width: '100%'
              }}>
                <h2 style={{
                  fontSize: '1.4rem',
                  color: '#dbeafe',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  margin: 0
                }}>
                  {currentMatchup.prompt}
                </h2>
              </div>

              {!canVote ? (
                // Player is in this matchup - cannot vote
                <div style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '2px solid #3b82f6',
                  borderRadius: '1rem',
                  padding: '2rem',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <div style={{
                    color: '#f59e0b',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '1rem'
                  }}>
                    You're in this matchup!
                  </div>
                  <div style={{
                    color: '#93c5fd',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}>
                    Waiting for others to vote...
                  </div>
                </div>
              ) : hasVoted ? (
                // Player has already voted
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  borderRadius: '1rem',
                  padding: '2rem',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <div style={{
                    color: '#10b981',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    marginBottom: '1rem'
                  }}>
                    ✓ Vote Submitted!
                  </div>
                  <div style={{
                    color: '#93c5fd',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}>
                    You voted for: {playerVote === currentMatchup.player1 ? currentMatchup.player1 : currentMatchup.player2}
                  </div>
                </div>
              ) : (
                // Show voting options
                <div style={{
                  display: 'flex',
                  gap: '2rem',
                  width: '100%'
                }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '2px solid #3b82f6',
                    borderRadius: '1rem',
                    padding: '2rem',
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleRound3Vote(currentMatchup.player1)}>
                    <div style={{
                      color: '#93c5fd',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '1rem'
                    }}>
                      {currentMatchup.player1}
                    </div>
                    <div style={{
                      color: '#dbeafe',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {currentMatchup.answer1}
                    </div>
                    <Button
                      style={{
                        fontSize: '1.1rem',
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                        color: '#dbeafe',
                        border: '2px solid #dbeafe',
                        borderRadius: '0.75rem',
                        fontFamily: 'Orbitron, sans-serif',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        width: '100%'
                      }}
                    >
                      Vote
                    </Button>
                  </div>

                  <div style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '2px solid #3b82f6',
                    borderRadius: '1rem',
                    padding: '2rem',
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleRound3Vote(currentMatchup.player2)}>
                    <div style={{
                      color: '#93c5fd',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '1rem'
                    }}>
                      {currentMatchup.player2}
                    </div>
                    <div style={{
                      color: '#dbeafe',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {currentMatchup.answer2}
                    </div>
                    <Button
                      style={{
                        fontSize: '1.1rem',
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                        color: '#dbeafe',
                        border: '2px solid #dbeafe',
                        borderRadius: '0.75rem',
                        fontFamily: 'Orbitron, sans-serif',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        width: '100%'
                      }}
                    >
                      Vote
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
        </div>
      );
    }

    // Results Phase - Individual matchup results
    if (round3Data.phase === 'results') {
      const currentMatchup = round3Data.matchups[round3Data.currentMatchup];
      if (!currentMatchup) return null;
      
      const player1Votes = currentMatchup.voteCounts?.player1 || 0;
      const player2Votes = currentMatchup.voteCounts?.player2 || 0;
      const winner = player1Votes > player2Votes ? currentMatchup.player1 : 
                    player2Votes > player1Votes ? currentMatchup.player2 : null;
      
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Orbitron, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '800px',
            width: '100%',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid #3b82f6',
            borderRadius: '1.5rem',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              color: '#10b981',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              Matchup Results
            </h2>
            
            <div style={{
              color: '#e0e7ff',
              fontSize: '1.2rem',
              fontWeight: 600,
              marginBottom: '2rem'
            }}>
              "{currentMatchup.prompt}"
            </div>
            
            {winner && (
              <div style={{
                color: '#10b981',
                fontSize: '1.8rem',
                fontWeight: 800,
                marginBottom: '2rem',
                textTransform: 'uppercase'
              }}>
                🏆 {winner} Wins!
              </div>
            )}
            
            {!winner && (
              <div style={{
                color: '#fbbf24',
                fontSize: '1.8rem',
                fontWeight: 800,
                marginBottom: '2rem',
                textTransform: 'uppercase'
              }}>
                It's a Tie!
              </div>
            )}
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #93c5fd',
                borderRadius: '1rem',
                padding: '1rem',
                flex: 1,
                maxWidth: '250px'
              }}>
                <div style={{
                  color: '#dbeafe',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem'
                }}>
                  {currentMatchup.player1}
                </div>
                <div style={{
                  color: '#93c5fd',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  fontStyle: 'italic'
                }}>
                  "{currentMatchup.answer1}"
                </div>
                <div style={{
                  color: '#dbeafe',
                  fontSize: '1.2rem',
                  fontWeight: 800
                }}>
                  {player1Votes} votes
                </div>
              </div>
              
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #93c5fd',
                borderRadius: '1rem',
                padding: '1rem',
                flex: 1,
                maxWidth: '250px'
              }}>
                <div style={{
                  color: '#dbeafe',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem'
                }}>
                  {currentMatchup.player2}
                </div>
                <div style={{
                  color: '#93c5fd',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  fontStyle: 'italic'
                }}>
                  "{currentMatchup.answer2}"
                </div>
                <div style={{
                  color: '#dbeafe',
                  fontSize: '1.2rem',
                  fontWeight: 800
                }}>
                  {player2Votes} votes
                </div>
              </div>
            </div>
            
            <div style={{
              color: '#fbbf24',
              fontSize: '1.3rem',
              fontWeight: 700
            }}>
              {round3Data.currentMatchup + 1 < round3Data.totalMatchups 
                ? `Next matchup in ${round3Data.timeRemaining}s...`
                : `Final results in ${round3Data.timeRemaining}s...`
              }
            </div>
          </div>
          
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
        </div>
      );
    }

    // Final Results Phase
    if (round3Data.phase === 'complete') {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Orbitron, sans-serif',
          padding: '2rem'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#dbeafe',
              textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
              marginBottom: '2rem',
              letterSpacing: '0.08em',
              fontFamily: 'Orbitron, sans-serif',
              textTransform: 'uppercase'
            }}>
              Final Results
            </h1>
          </div>

          {/* Leaderboard */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '600px',
            margin: '0 auto',
            width: '100%',
            gap: '1rem'
          }}>
            {Object.entries(round3Data.scores)
              .sort(([,a], [,b]) => b - a)
              .map(([player, score], index) => (
                <div key={player} style={{
                  background: player === playerName 
                    ? (index === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)')
                    : (index === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                  border: player === playerName 
                    ? (index === 0 ? '3px solid #10b981' : '3px solid #3b82f6')
                    : (index === 0 ? '2px solid #10b981' : '1px solid #93c5fd'),
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      color: index === 0 ? '#10b981' : '#93c5fd',
                      fontSize: '1.5rem',
                      fontWeight: 900
                    }}>
                      #{index + 1}
                    </div>
                    <div style={{
                      color: '#dbeafe',
                      fontSize: player === playerName ? '1.4rem' : '1.2rem',
                      fontWeight: player === playerName ? 800 : 700,
                      textTransform: 'uppercase'
                    }}>
                      {player}
                      {player === playerName && ' (YOU)'}
                    </div>
                  </div>
                  <div style={{
                    color: index === 0 ? '#10b981' : '#dbeafe',
                    fontSize: '1.3rem',
                    fontWeight: 800
                  }}>
                    {score} pts
                  </div>
                </div>
              ))}
          </div>

          {/* Your performance summary */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid #3b82f6',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              color: '#93c5fd',
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}>
              Your Performance
            </div>
            <div style={{
              color: '#dbeafe',
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              You scored {round3Data.scores[playerName!] || 0} points
            </div>
          </div>
          
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
        </div>
      );
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #1e40af 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Orbitron, sans-serif',
      padding: '2rem'
    }}>
      {allReady ? (
        // Show game starting message when all players are ready
        <div style={{
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#dbeafe',
            textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
            marginBottom: '2rem',
            letterSpacing: '0.08em',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase'
          }}>
            All Players Ready!
          </h1>
          <div style={{
            color: '#93c5fd',
            fontSize: '1.5rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Game Starting...
          </div>
        </div>
      ) : (
        // Show ready up interface
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#dbeafe',
            textShadow: '0 2px 16px #1d4ed8, 0 0px 8px #2563eb',
            marginBottom: '2rem',
            letterSpacing: '0.08em',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase'
          }}>
            Welcome, {playerName}!
          </h1>
          
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '2px solid #3b82f6',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              color: '#dbeafe',
              fontSize: '1.3rem',
              marginBottom: '2rem',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              Players Ready: {gameData?.readyPlayers?.length || 0} / {gameData?.players?.length || 0}
            </div>
            
            {!isReady ? (
              <Button
                style={{
                  fontSize: '1.5rem',
                  padding: '1rem 3rem',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                  color: '#dbeafe',
                  border: '2px solid #dbeafe',
                  borderRadius: '1.5em',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 24px #3b82f688'
                }}
                onClick={handleReadyUp}
              >
                Ready Up
              </Button>
            ) : (
              <div style={{
                color: '#10b981',
                fontSize: '1.5rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '1rem',
                border: '2px solid #10b981',
                borderRadius: '1rem',
                background: 'rgba(16, 185, 129, 0.1)'
              }}>
                ✓ You are Ready!
              </div>
            )}
            
            <div style={{
              color: '#93c5fd',
              fontSize: '1.1rem',
              marginTop: '1.5rem',
              fontWeight: 700
            }}>
              Waiting for other players...
            </div>
          </div>
        </div>
      )}
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
    </div>
  );
};

export default MatchUpPlayer;
