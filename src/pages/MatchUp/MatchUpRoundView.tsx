import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { ref, onValue, runTransaction, set } from 'firebase/database';
import { Button } from '../Common/Button';

// Question bank for "Who is most likely to..." questions
const MOST_LIKELY_QUESTIONS = [
  "Who is most likely to survive a zombie apocalypse?",
  "Who is most likely to become famous?",
  "Who is most likely to forget their significant other's birthday?",
  "Who is most likely to win a reality TV show?",
  "Who is most likely to become a millionaire?",
  "Who is the most likely to black out?",
  "Who is the most likely to be kicked out of a bar?",
  "Who is the most likely to get a pet?",
  "Who is the most likely to purchase a concealed weapon?",
  "Who is the most likely to get a buzz cut?",
  "Who is the most likely to enlist in the military?",
  "Who is the most likely to date a furry?",
  "Who is the most likely to meet Chris Hansen?",
  "Who is the most likely to steal to get by?",
  "Who is the most likely to vote for an independent candidate?",
  "Who is the most likely to be on Tinder?",
  "Who is the most likely to go home with someone?",
  "Who is the loudest during sex?",
  "Who is the most unclean?",
  "Who is most likely to get caught doing PDA?",
  "Who has the best style?",
  "Who do you trust more with AUX?",
  "Who is the most likely to go to Lucky's?",
  "Who is most likely to flake on a plan they made?",
  "Who is most likely to become a cult leader?",
  "Who is most likely to crash their car?",
  "Who is most likely to marry for money?",
  "Who is most likely to start an OnlyFans?",
  "Who is most likely to send a risky text to the wrong person?",
  "Who is most likely to fake being sick to skip work?",
  "Who is most likely to hook up with an ex?",
  "Who is most likely to get a tattoo they regret?",
  "Who is most likely to try a weird food first?",
  "Who is most likely to forget where they parked?",
  "Who is most likely to sing karaoke completely sober?",
  "Who is most likely to cry during a movie?",
  "Who is most likely to get into a bar fight?",
  "Who is most likely to accidentally spoil a TV show or movie?",
  "Who is most likely to flirt with the bartender?",
  "Who is most likely to own too many houseplants?",
  "Who is most likely to ghost someone after a date?",
  "Who is most likely to go skydiving on a whim?",
  "Who is most likely to text their boss while drunk?",
  "Who is most likely to disappear at a party without saying goodbye?",
  "Who is most likely to adopt a weird accent after one drink?",
  "Who is most likely to run for local office as a joke?",
  "Who is most likely to be the first to fall asleep tonight?",
  "Who is most likely to take a dare too far?",
  "Who is most likely to overshare in a group chat?",
  "Who is the most likely to cry during a movie?",
  "Who is most likely to try cocaine?"

];

// Round 2 prompts - Add your custom prompts here
export const ROUND_2_PROMPTS: string[] = [
  "If you are reading this take a sip",
  "First person to touch the ceiling gets to give out 4 sips",
  "Last person to say a color takes a sip",
  "If you have a public instagram you get to give out 2 sips",
  "If you are not a part of the allies give out 1 sip",
  "If you are drinking beer right now, drink some more",
  "If you are wearing a sweatshirt, give out 3 sips",
  "Everyone close their eyes and hold out either a 1 or 2 with their fingers, minority gives out 2 sips each",
  "If you are the youngest player, give out 2 sips",
  "If you have a girlfriend but she is not there take 2 sips",
  "Last person to clap takes a sip",
  "Mini Game: Go around in a circle naming female athletes, first to fail take 4 sips",
  "Mini Game: Go around in a circle naming vegetables, first to fail take 4 sips",
  "Mini Game: Go around in a circle naming car brands, first to fail take 4 sips",
  "Mini Game: Go around in a circle naming comedians, first to fail take 4 sips",
  "Mini Game: Go around in a circle naming college majors, first to fail take 4 sips",
  "Trap! For every type of dinosaur the other players can name you must take a sip",
  "Trap! For every country in Africa the other players can name you must take a sip",
  "Trap! For every Family guy characters the other players can name you must take a sip",
  "Mini Game: Go around the room saying something you have never done. Everyone who has done it takes a sip",
  "The next person or people who take a penalty sip get to give out 4 sips",
  "The oldest player gets to give out 2 sips",
  "First person to say the name of someone else's parent gets to give out 4 sips",
  "The person to your left gets to give out 3 sips",
  "Last person to have taken a sip, time to take a shot of the other players choice",


];

// Round 3 prompts - Quiplash-style fill-in-the-blank and open-ended prompts
export const ROUND_3_PROMPTS: string[] = [
  "The worst thing to say on a first date: ___",
  "A terrible name for a dating app: ___",
  "Something you should never Google: ___",
  "The worst possible Uber driver: ___",
  "A bad time to say 'I love you': ___",
  "The most inappropriate wedding gift: ___",
  "Something you don't want to hear from your doctor: ___",
  "A terrible superhero power: ___",
  "The worst thing to find in your food: ___",
  "A bad excuse for being late: ___",
  "Something you shouldn't do at a funeral: ___",
  "The worst possible roommate: ___",
  "A terrible name for a restaurant: ___",
  "Something you should never say to a police officer: ___",
  "The worst thing to hear over the airplane intercom: ___",
  "A bad place to propose marriage: ___",
  "Something you don't want to hear from your Uber driver: ___",
  "The worst possible secret Santa gift: ___",
  "A terrible thing to say during sex: ___",
  "Something you shouldn't do on a Zoom call: ___",
  "The worst possible tattoo: ___",
  "A bad time to run out of toilet paper: ___",
  "Something you don't want to find in your pocket: ___",
  "The worst possible last words: ___",
  "A terrible name for a baby: ___",
  "Something you shouldn't do at a job interview: ___",
  "The worst thing to say to your ex: ___",
  "A bad place to take a selfie: ___",
  "Something you don't want to hear from your dentist: ___",
  "The worst possible Tinder bio: ___",
  "The worst thing to do on a religious holiday: ___",
  "The most awkward thing to say during a job interview: ___",
  "The worst thing to say during your honeymoon: ___",
  "The most awkward thing to say during your first time: ___",
  "The worst thing to say during a family gathering: ___",
  "A terrible thing to do to the Allies: ___",
  "What you'd love to see when walking into Lucky's: ___",
  "An important lesson you learn from church: ___",
  "Where you would expect to find a child: ___",
  "Something you should never do in Orchard: ___",
  "Something you would never want to find in your Uncle's possession: ___",
  "The last thing you would want to see in the bathroom: ___",
  "The most embarrassing thing to say while giving a speech: ___",
  "Where you would least expect to find a priest: ___",
  "Something you should never do in a library: ___",

];

type MatchUpData = {
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
    votes: Record<string, string>; // voter -> chosen player
    voteCounts: { player1: number; player2: number };
    showResults: boolean;
    completed: boolean;
  };
  round2?: {
    currentPlayer: string;
    currentPrompt: string;
    isActive: boolean;
    previousPlayer?: string;
    prompts?: string[];
  };
  round3?: {
    phase: 'writing' | 'voting' | 'results' | 'complete';
    currentMatchup: number;
    totalMatchups: number;
    timeRemaining: number;
    playerPrompts: Record<string, string[]>; // player -> array of 3 prompts
    playerAnswers: Record<string, string[]>; // player -> array of 3 answers
    matchups: Array<{
      prompt: string;
      player1: string;
      player2: string;
      answer1: string;
      answer2: string;
      votes: Record<string, string>; // voter -> chosen player
      voteCounts: { player1: number; player2: number };
      winner?: string;
      voterDetails?: Record<string, string>; // for showing who voted for what
    }>;
    scores: Record<string, number>; // player -> total points
  };
};

const MatchUpRoundView: React.FC = () => {
  const { gameId, roundNumber } = useParams<{ gameId: string; roundNumber: string }>();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<MatchUpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for game data changes
  useEffect(() => {
    if (!gameId) return;
    const gameRef = ref(db, `matchup-lobbies/${gameId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          console.log('Host received game data:', data);
          setGameData(data);
          setLoading(false);
          setError(null);
        } else {
          setError('Game not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error processing game data:', err);
        setError('Error loading game data');
        setLoading(false);
      }
    }, (err) => {
      console.error('Firebase listener error:', err);
      setError('Database connection error');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  // Initialize Round 1 when component mounts
  useEffect(() => {
    if (!gameId || !gameData || roundNumber !== '1' || gameData.round1) return;
    
    initializeRound1();
  }, [gameId, gameData, roundNumber]);

  // Initialize Round 2 when component mounts
  useEffect(() => {
    console.log('Round 2 useEffect triggered:', { 
      gameId, 
      gameData: !!gameData, 
      roundNumber, 
      round2Exists: !!gameData?.round2,
      currentRound: gameData?.currentRound,
      players: gameData?.players 
    });
    if (!gameId || !gameData || roundNumber !== '2') return;
    
    // If round2 data doesn't exist, initialize it
    if (!gameData.round2) {
      console.log('Calling initializeRound2 - no round2 data found');
      initializeRound2();
    } else {
      console.log('Round 2 data already exists:', gameData.round2);
    }
  }, [gameId, gameData, roundNumber]);

  // Initialize Round 3 when component mounts
  useEffect(() => {
    console.log('Round 3 useEffect triggered:', { 
      gameId, 
      gameData: !!gameData, 
      roundNumber, 
      round3Exists: !!gameData?.round3,
      currentRound: gameData?.currentRound,
      players: gameData?.players 
    });
    if (!gameId || !gameData || roundNumber !== '3') return;
    
    // If round3 data doesn't exist, initialize it
    if (!gameData.round3) {
      console.log('Calling initializeRound3 - no round3 data found');
      initializeRound3();
    } else {
      console.log('Round 3 data already exists:', gameData.round3);
    }
  }, [gameId, gameData, roundNumber]);

  // Monitor Round 3 phase changes to restart timers
  useEffect(() => {
    if (!gameId || !gameData?.round3) return;
    
    const round3Data = gameData.round3;
    
    // Start timer when entering voting phase
    if (round3Data.phase === 'voting' && round3Data.timeRemaining > 0) {
      startWritingTimer(); // Reuse the same timer function
    }
  }, [gameData?.round3?.phase, gameData?.round3?.currentMatchup]);

  // Check if all eligible players have voted in Round 3
  useEffect(() => {
    if (!gameData?.round3 || gameData.round3.phase !== 'voting' || !gameData.players) return;
    
    const currentMatchup = gameData.round3.matchups[gameData.round3.currentMatchup];
    if (!currentMatchup) return;
    
    const eligibleVoters = gameData.players.filter(player => 
      player !== currentMatchup.player1 && player !== currentMatchup.player2
    );
    const votes = currentMatchup.votes || {};
    const votedPlayers = Object.keys(votes);

    // If all eligible players have voted, show results immediately
    if (eligibleVoters.length > 0 && votedPlayers.length === eligibleVoters.length) {
      showMatchupResults();
    }
  }, [gameData?.round3?.matchups]);

  const showMatchupResults = async () => {
    if (!gameId || !gameData?.round3) return;

    await runTransaction(ref(db, `matchup-lobbies/${gameId}/round3`), (current) => {
      if (!current || current.phase !== 'voting') return current;
      
      return {
        ...current,
        phase: 'results' as const,
        timeRemaining: 10 // 10 seconds to show results
      };
    });
  };

  // One-time fix for existing games stuck in this state
  useEffect(() => {
    if (!gameId || !gameData || roundNumber !== '2') return;
    
    // If currentRound is 2 but round2 data is missing, fix it immediately
    if (gameData.currentRound === 2 && !gameData.round2 && gameData.players) {
      console.log('Fixing stuck Round 2 game');
      const randomPlayer = selectRandomPlayer(gameData.players);
      const prompt = getRandomPrompt();
      
      set(ref(db, `matchup-lobbies/${gameId}/round2`), {
        currentPlayer: randomPlayer,
        currentPrompt: prompt,
        isActive: true
      }).then(() => {
        console.log('Fixed stuck Round 2 game');
      }).catch((error) => {
        console.error('Failed to fix stuck Round 2 game:', error);
      });
    }
  }, [gameId, gameData, roundNumber]);

  const initializeRound1 = async () => {
    if (!gameId || !gameData?.players || gameData.players.length < 2) return;

    const { player1, player2 } = selectRandomPlayers(gameData.players);
    const question = MOST_LIKELY_QUESTIONS[Math.floor(Math.random() * MOST_LIKELY_QUESTIONS.length)];

    // Set currentRound to 1 and initialize round1 data
    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          currentRound: 1,
          round1: {
            currentMatchup: 1,
            player1,
            player2,
            question,
            votes: {},
            voteCounts: { player1: 0, player2: 0 },
            showResults: false,
            completed: false
          }
        };
      });
      
      // Also explicitly set the votes field to ensure it exists
      await set(ref(db, `matchup-lobbies/${gameId}/round1/votes`), {});
    } catch (error) {
      console.error('Failed to initialize Round 1:', error);
    }
  };

  const selectRandomPlayers = (players: string[]) => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    return {
      player1: shuffled[0],
      player2: shuffled[1]
    };
  };

  const handleSkipVotes = async () => {
    if (!gameId || !gameData?.round1) return;

    await runTransaction(ref(db, `matchup-lobbies/${gameId}/round1`), (current) => {
      if (!current) return current;
      return { ...current, showResults: true };
    });

    // Show results for 7 seconds, then move to next matchup
    setTimeout(() => {
      moveToNextMatchup();
    }, 7000);
  };

  const moveToNextMatchup = async () => {
    if (!gameId || !gameData?.round1 || !gameData.players) return;

    const nextMatchupNumber = gameData.round1.currentMatchup + 1;

    if (nextMatchupNumber > 15) {
      // Round 1 complete, go back to round selection
      await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          currentRound: undefined,
          round1: {
            ...currentData.round1,
            completed: true
          }
        };
      });
      navigate(`/game/matchup/${gameId}/host`);
      return;
    }

    // Start next matchup
    const { player1, player2 } = selectRandomPlayers(gameData.players);
    const question = MOST_LIKELY_QUESTIONS[Math.floor(Math.random() * MOST_LIKELY_QUESTIONS.length)];

    console.log('Moving to next matchup:', nextMatchupNumber, 'with players:', player1, player2);

    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}/round1`), (current) => {
        if (!current) return current;
        const newData = {
          ...current,
          currentMatchup: nextMatchupNumber,
          player1,
          player2,
          question,
          votes: {},
          voteCounts: { player1: 0, player2: 0 },
          showResults: false
        };
        console.log('Setting new round1 data:', newData);
        return newData;
      });
      
      // Also explicitly set the votes field to ensure it exists
      await set(ref(db, `matchup-lobbies/${gameId}/round1/votes`), {});
      console.log('Successfully moved to next matchup');
    } catch (error) {
      console.error('Failed to move to next matchup:', error);
    }
  };

  // Round 2 Functions
  const initializeRound2 = async () => {
    console.log('initializeRound2 called', { gameId, players: gameData?.players });
    if (!gameId || !gameData?.players || gameData.players.length < 1) {
      console.log('Early return from initializeRound2 - invalid conditions');
      return;
    }

    const randomPlayer = selectRandomPlayer(gameData.players);
    const prompt = getRandomPrompt();

    console.log('Initializing Round 2 with:', { randomPlayer, prompt });

    try {
      // Use runTransaction to ensure the data is set properly
      await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
        if (!currentData) {
          console.log('No current data in transaction');
          return currentData;
        }
        console.log('Firebase transaction for Round 2, current round:', currentData.currentRound);
        const updatedData = {
          ...currentData,
          currentRound: 2,
          round2: {
            currentPlayer: randomPlayer,
            currentPrompt: prompt,
            isActive: true
          }
        };
        console.log('Returning updated data from transaction:', updatedData);
        return updatedData;
      });
      console.log('Round 2 initialized successfully via transaction');
    } catch (error) {
      console.error('Failed to initialize Round 2 via transaction:', error);
      
      // Fallback: try direct set
      try {
        console.log('Attempting fallback direct set for Round 2');
        await set(ref(db, `matchup-lobbies/${gameId}/round2`), {
          currentPlayer: randomPlayer,
          currentPrompt: prompt,
          isActive: true
        });
        console.log('Round 2 data set via direct set fallback');
      } catch (setError) {
        console.error('Direct set fallback also failed:', setError);
      }
    }
  };

  const selectRandomPlayer = (players: string[], excludePlayer?: string) => {
    let availablePlayers = players;
    if (excludePlayer) {
      availablePlayers = players.filter(p => p !== excludePlayer);
    }
    if (availablePlayers.length === 0) {
      availablePlayers = players; // Fallback if all players excluded
    }
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    return availablePlayers[randomIndex];
  };

  const getRandomPrompt = () => {
    if (ROUND_2_PROMPTS.length === 0) {
      return "Tell the group something interesting about yourself"; // Fallback prompt
    }
    const randomIndex = Math.floor(Math.random() * ROUND_2_PROMPTS.length);
    return ROUND_2_PROMPTS[randomIndex];
  };

  // Round 3 Functions
  const initializeRound3 = async () => {
    console.log('initializeRound3 called', { gameId, players: gameData?.players });
    if (!gameId || !gameData?.players || gameData.players.length < 2) {
      console.log('Early return from initializeRound3 - need at least 2 players');
      return;
    }

    const players = gameData.players;
    const playerPrompts: Record<string, string[]> = {};
    const playerAnswers: Record<string, string[]> = {};
    const scores: Record<string, number> = {};
    
    // Initialize scores
    players.forEach(player => {
      scores[player] = 0;
    });

    // Assign prompts ensuring each prompt is shared by exactly 2 players
    const shuffledPrompts = [...ROUND_3_PROMPTS].sort(() => Math.random() - 0.5);
    
    // Initialize player prompt arrays
    players.forEach(player => {
      playerPrompts[player] = [];
      playerAnswers[player] = ['', '', '']; // Empty answers initially
    });
    
    // Calculate maximum possible matchups
    // Each player writes 3 jokes, so total jokes = players.length * 3
    // Each matchup uses 2 jokes, so max matchups = floor(total_jokes / 2)
    // But we want the highest even number to ensure all matchups are complete
    const totalJokes = players.length * 3;
    const maxPossibleMatchups = Math.floor(totalJokes / 2);
    
    console.log(`Creating matchups for ${players.length} players: ${totalJokes} total jokes, ${maxPossibleMatchups} possible matchups`);
    
    // Create matchups by assigning each prompt to exactly 2 players
    const matchups: Array<{
      prompt: string;
      player1: string;
      player2: string;
      answer1: string;
      answer2: string;
      votes: Record<string, string>;
      voteCounts: { player1: number; player2: number };
    }> = [];
    
    // Generate all possible pairs of players and shuffle them
    const playerPairs = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        playerPairs.push([players[i], players[j]]);
      }
    }
    
    // Strategy: Distribute prompts to maximize matchups while ensuring each player gets exactly 3 prompts
    let promptIndex = 0;
    let playerPromptCounts = players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {} as Record<string, number>);
    
    // Create matchups until we reach the maximum or run out of prompts
    for (let matchupIndex = 0; matchupIndex < maxPossibleMatchups && promptIndex < shuffledPrompts.length; matchupIndex++) {
      const prompt = shuffledPrompts[promptIndex];
      
      // Find the best pair of players for this prompt
      // Prioritize players who have fewer prompts assigned
      let bestPair: [string, string] | null = null;
      let lowestTotalCount = Infinity;
      
      for (const [player1, player2] of playerPairs) {
        const count1 = playerPromptCounts[player1];
        const count2 = playerPromptCounts[player2];
        const totalCount = count1 + count2;
        
        // Only consider this pair if both players can still accept more prompts
        if (count1 < 3 && count2 < 3 && totalCount < lowestTotalCount) {
          bestPair = [player1, player2];
          lowestTotalCount = totalCount;
        }
      }
      
      if (bestPair) {
        const [player1, player2] = bestPair;
        
        // Add this prompt to both players' lists
        playerPrompts[player1].push(prompt);
        playerPrompts[player2].push(prompt);
        playerPromptCounts[player1]++;
        playerPromptCounts[player2]++;
        
        // Create the matchup
        matchups.push({
          prompt,
          player1,
          player2,
          answer1: '',
          answer2: '',
          votes: {},
          voteCounts: { player1: 0, player2: 0 }
        });
        
        promptIndex++;
      } else {
        // If we can't find a suitable pair, we've reached the maximum
        break;
      }
    }
    
    // Fill remaining slots for players who need more prompts (up to 3 each)
    // These will be "solo" prompts that don't create matchups
    players.forEach(player => {
      while (playerPrompts[player].length < 3 && promptIndex < shuffledPrompts.length) {
        const prompt = shuffledPrompts[promptIndex];
        // Make sure this prompt isn't already assigned to this player
        if (!playerPrompts[player].includes(prompt)) {
          playerPrompts[player].push(prompt);
          promptIndex++;
        } else {
          promptIndex++;
        }
      }
      
      // Ensure each player has exactly 3 prompts, pad with unique prompts if needed
      while (playerPrompts[player].length < 3) {
        playerPrompts[player].push(`Bonus prompt ${playerPrompts[player].length + 1} for ${player}`);
      }
    });
    
    console.log(`Created ${matchups.length} matchups:`, matchups.map(m => ({ prompt: m.prompt, players: [m.player1, m.player2] })));

    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
        if (!currentData) return currentData;
        
        return {
          ...currentData,
          currentRound: 3,
          round3: {
            phase: 'writing' as const,
            currentMatchup: 0,
            totalMatchups: matchups.length,
            timeRemaining: 120, // 2 minutes for writing
            playerPrompts,
            playerAnswers,
            matchups: matchups,
            scores
          }
        };
      });
      
      console.log('Round 3 initialized successfully');
      
      // Start the writing timer
      startWritingTimer();
      
    } catch (error) {
      console.error('Failed to initialize Round 3:', error);
    }
  };

  const startWritingTimer = () => {
    if (!gameId) return;
    
    const timerInterval = setInterval(async () => {
      try {
        await runTransaction(ref(db, `matchup-lobbies/${gameId}/round3`), (current) => {
          if (!current) {
            clearInterval(timerInterval);
            return current;
          }
          
          const newTime = current.timeRemaining - 1;
          
          if (current.phase === 'writing' && newTime <= 0) {
            clearInterval(timerInterval);
            // Populate matchups with actual answers and move to voting
            return moveToVotingPhase(current);
          } else if (current.phase === 'voting' && newTime <= 0) {
            clearInterval(timerInterval);
            // Show results for current matchup
            return {
              ...current,
              phase: 'results' as const,
              timeRemaining: 10 // 10 seconds to show results
            };
          } else if (current.phase === 'results' && newTime <= 0) {
            clearInterval(timerInterval);
            // Move to next matchup or final results
            return progressVotingPhase(current);
          }
          
          return {
            ...current,
            timeRemaining: newTime
          };
        });
      } catch (error) {
        console.error('Timer update failed:', error);
        clearInterval(timerInterval);
      }
    }, 1000);
  };

  const moveToVotingPhase = (current: any) => {
    if (!gameData?.players) return current;
    
    // Update matchups with actual player answers
    const updatedMatchups = current.matchups.map((matchup: any) => {
      const player1Answers = current.playerAnswers[matchup.player1] || [];
      const player2Answers = current.playerAnswers[matchup.player2] || [];
      
      // Find the answers for this prompt
      const player1PromptIndex = (current.playerPrompts[matchup.player1] || []).indexOf(matchup.prompt);
      const player2PromptIndex = (current.playerPrompts[matchup.player2] || []).indexOf(matchup.prompt);
      
      return {
        ...matchup,
        answer1: player1PromptIndex >= 0 ? (player1Answers[player1PromptIndex] || 'No answer') : 'No answer',
        answer2: player2PromptIndex >= 0 ? (player2Answers[player2PromptIndex] || 'No answer') : 'No answer'
      };
    });
    
    return {
      ...current,
      phase: 'voting' as const,
      timeRemaining: 30,
      currentMatchup: 0,
      matchups: updatedMatchups
    };
  };

  const progressVotingPhase = (current: any) => {
    const nextMatchup = current.currentMatchup + 1;
    
    if (nextMatchup >= current.totalMatchups) {
      // All matchups done, calculate final scores and move to results
      return calculateFinalScores(current);
    } else {
      // Move to next matchup
      return {
        ...current,
        phase: 'voting' as const,
        currentMatchup: nextMatchup,
        timeRemaining: 30 // 30 seconds for next vote
      };
    }
  };

  const handleRestartGame = async () => {
    if (!gameId) return;
    
    try {
      await runTransaction(ref(db, `matchup-lobbies/${gameId}`), (currentData) => {
        if (!currentData) return currentData;
        
        // Keep players but reset everything else
        return {
          players: currentData.players,
          max: currentData.max,
          phase: 'waiting', // Reset to waiting phase
          readyPlayers: [], // Clear ready players
          currentRound: undefined // Clear current round
          // Remove all round data
        };
      });
      
      console.log('Game restarted successfully');
      
    } catch (error) {
      console.error('Failed to restart game:', error);
    }
  };

  const calculateFinalScores = (current: any) => {
    const scores = { ...current.scores };
    
    // Calculate points for each matchup
    current.matchups.forEach((matchup: any) => {
      const player1Votes = matchup.voteCounts?.player1 || 0;
      const player2Votes = matchup.voteCounts?.player2 || 0;
      
      // Base points: 100 per vote
      scores[matchup.player1] = (scores[matchup.player1] || 0) + (player1Votes * 100);
      scores[matchup.player2] = (scores[matchup.player2] || 0) + (player2Votes * 100);
      
      // Winner bonus: 200 points
      if (player1Votes > player2Votes) {
        scores[matchup.player1] = (scores[matchup.player1] || 0) + 200;
      } else if (player2Votes > player1Votes) {
        scores[matchup.player2] = (scores[matchup.player2] || 0) + 200;
      }
      
      // Sweep bonus: 400 points if all votes
      const totalVotes = player1Votes + player2Votes;
      if (totalVotes > 0) {
        if (player1Votes === totalVotes) {
          scores[matchup.player1] = (scores[matchup.player1] || 0) + 400;
        } else if (player2Votes === totalVotes) {
          scores[matchup.player2] = (scores[matchup.player2] || 0) + 400;
        }
      }
    });
    
    return {
      ...current,
      phase: 'complete' as const,
      scores,
      timeRemaining: 0
    };
  };

  // Check if all eligible players have voted
  useEffect(() => {
    if (!gameData?.round1 || !gameData.players || gameData.round1.showResults) return;

    const eligibleVoters = gameData.players.filter(player => 
      player !== gameData.round1!.player1 && player !== gameData.round1!.player2
    );
    const votes = gameData.round1.votes || {};
    const votedPlayers = Object.keys(votes);

    // If all eligible players have voted, show results automatically
    if (eligibleVoters.length > 0 && votedPlayers.length === eligibleVoters.length) {
      showResults();
    }
  }, [gameData?.round1?.votes]);

  const showResults = async () => {
    if (!gameId) return;

    await runTransaction(ref(db, `matchup-lobbies/${gameId}/round1`), (current) => {
      if (!current) return current;
      return { ...current, showResults: true };
    });

    // Move to next matchup after 7 seconds
    setTimeout(() => {
      moveToNextMatchup();
    }, 7000);
  };

  const handleBackToSelection = () => {
    navigate(`/game/matchup/${gameId}/host`);
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

  if (error) {
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
        <div style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2rem' }}>
          {error}
        </div>
        <Button
          style={{
            fontSize: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(168, 85, 247, 0.2)',
            color: '#f3e8ff',
            border: '1px solid #c084fc',
            borderRadius: '0.75rem',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
          onClick={() => navigate(`/game/matchup/${gameId}/host`)}
        >
          Back to Round Selection
        </Button>
      </div>
    );
  }

  if (roundNumber === '3') {
    // Round 3 specific content (Quiplash-style)
    const round3Data = gameData?.round3;
    console.log('Rendering Round 3 - round3Data:', round3Data, 'gameData:', gameData);
    
    if (!round3Data) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Orbitron, sans-serif',
          position: 'relative',
          padding: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <div style={{ color: '#f3e8ff', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
              Initializing Round 3...
            </div>
            <div style={{ color: '#c084fc', fontSize: '1rem', textAlign: 'center' }}>
              Setting up Quiplash-style gameplay...
            </div>
          </div>
        </div>
      );
    }

    // Helper function to format time
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Orbitron, sans-serif',
        position: 'relative',
        padding: '2rem'
      }}>
        {/* Back button */}
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem'
        }}>
          <Button
            style={{
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#f3e8ff',
              border: '1px solid #c084fc',
              borderRadius: '0.75rem',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
            onClick={handleBackToSelection}
          >
            Back to Round Selection
          </Button>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#f3e8ff',
            textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
            letterSpacing: '0.12em',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}>
            QUIPLASH
          </h1>
          <div style={{
            color: '#c084fc',
            fontSize: '1.2rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Round 3
          </div>
        </div>

        {/* Timer */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            fontSize: '2rem',
            color: round3Data.timeRemaining <= 10 ? '#f87171' : '#10b981',
            fontWeight: 900,
            textShadow: '0 2px 12px #a21caf'
          }}>
            {formatTime(round3Data.timeRemaining)}
          </div>
          <div style={{
            color: '#c084fc',
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginTop: '0.5rem'
          }}>
            {round3Data.phase === 'writing' ? 'Writing Time' : 
             round3Data.phase === 'voting' ? 'Voting Time' : 
             'Results'}
          </div>
        </div>

        {/* Content based on phase */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {round3Data.phase === 'writing' && (
            <div style={{
              textAlign: 'center',
              maxWidth: '800px',
              width: '100%'
            }}>
              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '2px solid #c084fc',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h2 style={{
                  fontSize: '1.8rem',
                  color: '#f3e8ff',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '1rem'
                }}>
                  Players are writing their jokes...
                </h2>
                <div style={{
                  color: '#c084fc',
                  fontSize: '1.2rem',
                  fontWeight: 700
                }}>
                  {round3Data.totalMatchups} matchups will be created
                </div>
              </div>
              
              {/* Show player progress */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                {gameData?.players?.map(player => {
                  const answers = round3Data.playerAnswers[player] || ['', '', ''];
                  const completedAnswers = answers.filter(answer => answer.trim() !== '').length;
                  
                  return (
                    <div key={player} style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid #c084fc',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        color: '#f3e8ff',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem'
                      }}>
                        {player}
                      </div>
                      <div style={{
                        color: completedAnswers === 3 ? '#10b981' : '#c084fc',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        {completedAnswers}/3 jokes completed
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {round3Data.phase === 'voting' && (
            <div style={{
              textAlign: 'center',
              maxWidth: '1000px',
              width: '100%'
            }}>
              {/* Current matchup display */}
              {round3Data.currentMatchup < round3Data.matchups.length && (
                <div>
                  <div style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '2px solid #c084fc',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem'
                  }}>
                    <h2 style={{
                      fontSize: '1.8rem',
                      color: '#f3e8ff',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      marginBottom: '2rem'
                    }}>
                      {round3Data.matchups[round3Data.currentMatchup].prompt}
                    </h2>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '2rem'
                    }}>
                      {/* Player 1 Answer */}
                      <div style={{
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: '2px solid #a855f7',
                        borderRadius: '1rem',
                        padding: '2rem',
                        flex: 1,
                        minHeight: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          color: '#c084fc',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '1rem'
                        }}>
                          Option A
                        </div>
                        <div style={{
                          color: '#f3e8ff',
                          fontSize: '1.4rem',
                          fontWeight: 600,
                          textAlign: 'center'
                        }}>
                          {round3Data.matchups[round3Data.currentMatchup].answer1}
                        </div>
                      </div>

                      <div style={{
                        color: '#f3e8ff',
                        fontSize: '2rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        textShadow: '0 2px 16px #a21caf'
                      }}>
                        VS
                      </div>

                      {/* Player 2 Answer */}
                      <div style={{
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: '2px solid #a855f7',
                        borderRadius: '1rem',
                        padding: '2rem',
                        flex: 1,
                        minHeight: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          color: '#c084fc',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: '1rem'
                        }}>
                          Option B
                        </div>
                        <div style={{
                          color: '#f3e8ff',
                          fontSize: '1.4rem',
                          fontWeight: 600,
                          textAlign: 'center'
                        }}>
                          {round3Data.matchups[round3Data.currentMatchup].answer2}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voting progress */}
                  <div style={{
                    color: '#c084fc',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '1rem'
                  }}>
                    Matchup {round3Data.currentMatchup + 1} of {round3Data.totalMatchups}
                  </div>

                  {/* Show who has voted */}
                  <div style={{
                    color: '#93c5fd',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}>
                    Votes: {Object.keys(round3Data.matchups[round3Data.currentMatchup].votes || {}).length} / {(gameData?.players?.length || 0) - 2}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {round3Data.phase === 'results' && (
            <div style={{
              textAlign: 'center',
              maxWidth: '1000px',
              width: '100%'
            }}>
              {(() => {
                const currentMatchup = round3Data.matchups[round3Data.currentMatchup];
                if (!currentMatchup) return null;
                
                const player1Votes = currentMatchup.voteCounts?.player1 || 0;
                const player2Votes = currentMatchup.voteCounts?.player2 || 0;
                const winner = player1Votes > player2Votes ? currentMatchup.player1 : 
                              player2Votes > player1Votes ? currentMatchup.player2 : null;
                
                // Calculate points earned this round
                const player1Points = (player1Votes * 100) + (player1Votes > player2Votes ? 200 : 0) + 
                                     (player1Votes > 0 && player2Votes === 0 ? 400 : 0);
                const player2Points = (player2Votes * 100) + (player2Votes > player1Votes ? 200 : 0) + 
                                     (player2Votes > 0 && player1Votes === 0 ? 400 : 0);
                
                return (
                  <div style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '2px solid #c084fc',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem'
                  }}>
                    <h2 style={{
                      fontSize: '2.5rem',
                      color: '#10b981',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      marginBottom: '1rem'
                    }}>
                      Matchup Results
                    </h2>
                    
                    <div style={{
                      color: '#e0e7ff',
                      fontSize: '1.3rem',
                      fontWeight: 600,
                      marginBottom: '2rem'
                    }}>
                      "{currentMatchup.prompt}"
                    </div>
                    
                    {/* Winner announcement */}
                    {winner && (
                      <div style={{
                        color: '#10b981',
                        fontSize: '2rem',
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
                        fontSize: '2rem',
                        fontWeight: 800,
                        marginBottom: '2rem',
                        textTransform: 'uppercase'
                      }}>
                        It's a Tie!
                      </div>
                    )}
                    
                    {/* Vote breakdown */}
                    <div style={{
                      display: 'flex',
                      gap: '2rem',
                      justifyContent: 'center',
                      marginBottom: '2rem'
                    }}>
                      <div style={{
                        background: player1Votes > player2Votes ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                        border: player1Votes > player2Votes ? '2px solid #10b981' : '1px solid #c084fc',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        flex: 1,
                        maxWidth: '300px'
                      }}>
                        <div style={{
                          color: '#f3e8ff',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem'
                        }}>
                          {currentMatchup.player1}
                        </div>
                        <div style={{
                          color: '#93c5fd',
                          fontSize: '1rem',
                          marginBottom: '1rem',
                          fontStyle: 'italic'
                        }}>
                          "{currentMatchup.answer1}"
                        </div>
                        <div style={{
                          color: player1Votes > player2Votes ? '#10b981' : '#f3e8ff',
                          fontSize: '1.5rem',
                          fontWeight: 800
                        }}>
                          {player1Votes} votes
                        </div>
                        <div style={{
                          color: player1Votes > player2Votes ? '#10b981' : '#c084fc',
                          fontSize: '1.2rem',
                          fontWeight: 700
                        }}>
                          +{player1Points} points
                        </div>
                      </div>
                      
                      <div style={{
                        background: player2Votes > player1Votes ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                        border: player2Votes > player1Votes ? '2px solid #10b981' : '1px solid #c084fc',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        flex: 1,
                        maxWidth: '300px'
                      }}>
                        <div style={{
                          color: '#f3e8ff',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem'
                        }}>
                          {currentMatchup.player2}
                        </div>
                        <div style={{
                          color: '#93c5fd',
                          fontSize: '1rem',
                          marginBottom: '1rem',
                          fontStyle: 'italic'
                        }}>
                          "{currentMatchup.answer2}"
                        </div>
                        <div style={{
                          color: player2Votes > player1Votes ? '#10b981' : '#f3e8ff',
                          fontSize: '1.5rem',
                          fontWeight: 800
                        }}>
                          {player2Votes} votes
                        </div>
                        <div style={{
                          color: player2Votes > player1Votes ? '#10b981' : '#c084fc',
                          fontSize: '1.2rem',
                          fontWeight: 700
                        }}>
                          +{player2Points} points
                        </div>
                      </div>
                    </div>
                    
                    {/* Timer for next round */}
                    <div style={{
                      color: '#fbbf24',
                      fontSize: '1.5rem',
                      fontWeight: 700
                    }}>
                      {round3Data.currentMatchup + 1 < round3Data.totalMatchups 
                        ? `Next matchup in ${round3Data.timeRemaining}s...`
                        : `Final results in ${round3Data.timeRemaining}s...`
                      }
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {round3Data.phase === 'complete' && (
            <div style={{
              textAlign: 'center',
              maxWidth: '1000px',
              width: '100%'
            }}>
              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '2px solid #c084fc',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h2 style={{
                  fontSize: '2.5rem',
                  color: '#10b981',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '2rem'
                }}>
                  Final Results
                </h2>
                
                {/* Leaderboard */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {Object.entries(round3Data.scores)
                    .sort(([,a], [,b]) => b - a)
                    .map(([player, score], index) => (
                      <div key={player} style={{
                        background: index === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.1)',
                        border: index === 0 ? '2px solid #10b981' : '1px solid #c084fc',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}>
                          <div style={{
                            color: index === 0 ? '#10b981' : '#c084fc',
                            fontSize: '1.5rem',
                            fontWeight: 900
                          }}>
                            #{index + 1}
                          </div>
                          <div style={{
                            color: '#f3e8ff',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {player}
                          </div>
                        </div>
                        <div style={{
                          color: index === 0 ? '#10b981' : '#f3e8ff',
                          fontSize: '1.5rem',
                          fontWeight: 800
                        }}>
                          {score} points
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <button
                style={{
                  fontSize: '1.5rem',
                  padding: '1rem 2rem',
                  background: 'rgba(16, 185, 129, 0.3)',
                  color: '#f3e8ff',
                  border: '2px solid #10b981',
                  borderRadius: '1rem',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
                onClick={handleRestartGame}
              >
                Restart Game
              </button>
            </div>
          )}
        </div>
        
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
      </div>
    );
  }

  if (roundNumber === '2') {
    // Round 2 specific content
    const round2Data = gameData?.round2;
    console.log('Rendering Round 2 - round2Data:', round2Data, 'gameData:', gameData);
    
    if (!round2Data) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Orbitron, sans-serif',
          position: 'relative',
          padding: '2rem'
        }}>
          <div style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem'
          }}>
            <Button
              style={{
                fontSize: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#f3e8ff',
                border: '1px solid #c084fc',
                borderRadius: '0.75rem',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
              onClick={handleBackToSelection}
            >
              Back to Round Selection
            </Button>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <div style={{ color: '#f3e8ff', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
              Initializing Round 2...
            </div>
            <div style={{ color: '#c084fc', fontSize: '1rem', textAlign: 'center' }}>
              If this takes too long, try clicking "Back to Round Selection" and select Round 2 again.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Orbitron, sans-serif',
        position: 'relative',
        padding: '2rem'
      }}>
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem'
        }}>
          <Button
            style={{
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#f3e8ff',
              border: '1px solid #c084fc',
              borderRadius: '0.75rem',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
            onClick={handleBackToSelection}
          >
            Back to Round Selection
          </Button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#f3e8ff',
            textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
            letterSpacing: '0.12em',
            textAlign: 'center',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            The Host
          </h1>
          
          <div style={{
            fontSize: '4rem',
            color: '#c084fc',
            textAlign: 'center',
            fontWeight: 900,
            textTransform: 'uppercase',
            marginBottom: '2rem',
            textShadow: '0 2px 12px #a21caf'
          }}>
            {round2Data.currentPlayer}
          </div>
        </div>
        
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
      </div>
    );
  }

  if (roundNumber !== '1') {
    // For other rounds, show placeholder
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Orbitron, sans-serif',
        position: 'relative',
        padding: '2rem'
      }}>
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem'
        }}>
          <Button
            style={{
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#f3e8ff',
              border: '1px solid #c084fc',
              borderRadius: '0.75rem',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
            onClick={handleBackToSelection}
          >
            Back to Round Selection
          </Button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}>
          <h1 style={{
            fontSize: '4rem',
            color: '#f3e8ff',
            textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
            letterSpacing: '0.12em',
            textAlign: 'center',
            fontFamily: 'Orbitron, sans-serif',
            textTransform: 'uppercase',
            marginBottom: '2rem'
          }}>
            Round {roundNumber}
          </h1>
          
          <div style={{
            color: '#c084fc',
            fontSize: '1.5rem',
            textAlign: 'center',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Coming Soon...
          </div>
        </div>
        
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
      </div>
    );
  }

  // Round 1 specific content
  const round1Data = gameData?.round1;
  if (!round1Data) {
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
        <div style={{ color: '#f3e8ff', fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Initializing Round 1...</div>
      </div>
    );
  }

  // Ensure voteCounts exists with default values
  const voteCounts = round1Data.voteCounts || { player1: 0, player2: 0 };
  const player1Votes = voteCounts.player1;
  const player2Votes = voteCounts.player2;
  const winner = player1Votes > player2Votes ? round1Data.player1 : 
                 player2Votes > player1Votes ? round1Data.player2 : null;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(45deg, #581c87 0%, #7c3aed 35%, #a855f7 65%, #581c87 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Orbitron, sans-serif',
      position: 'relative',
      padding: '2rem'
    }}>
      {/* Back button in top right */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '2rem'
      }}>
        <Button
          style={{
            fontSize: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(168, 85, 247, 0.2)',
            color: '#f3e8ff',
            border: '1px solid #c084fc',
            borderRadius: '0.75rem',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
          onClick={handleBackToSelection}
        >
          Back to Round Selection
        </Button>
      </div>

      {/* Round header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#f3e8ff',
          textShadow: '0 2px 16px #a21caf, 0 0px 8px #6d28d9',
          letterSpacing: '0.08em',
          fontFamily: 'Orbitron, sans-serif',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          MATCH-UP
        </h1>
        <div style={{
          color: '#c084fc',
          fontSize: '1.2rem',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          Matchup {round1Data.currentMatchup} of 15
        </div>
      </div>

      {/* Main matchup content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Question */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.15)',
          border: '2px solid #a855f7',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '3rem',
          textAlign: 'center',
          width: '100%'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#f3e8ff',
            fontWeight: 800,
            textTransform: 'uppercase',
            margin: 0
          }}>
            {round1Data.question}
          </h2>
        </div>

        {/* Players */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: '2rem'
        }}>
          {/* Player 1 */}
          <div style={{
            background: (round1Data.showResults && winner === round1Data.player1) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.15)',
            border: (round1Data.showResults && winner === round1Data.player1) ? '2px solid #10b981' : '2px solid #a855f7',
            borderRadius: '1.5rem',
            padding: '2rem',
            textAlign: 'center',
            flex: 1,
            minHeight: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: (round1Data.showResults && winner === round1Data.player1) ? '#10b981' : '#f3e8ff',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              {round1Data.player1}
            </h3>
            {round1Data.showResults && (
              <div style={{
                color: (winner === round1Data.player1) ? '#10b981' : '#c084fc',
                fontSize: '1.2rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Votes: {player1Votes}
              </div>
            )}
          </div>

          {/* VS */}
          <div style={{
            color: '#f3e8ff',
            fontSize: '2rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            textShadow: '0 2px 16px #a21caf'
          }}>
            VS
          </div>

          {/* Player 2 */}
          <div style={{
            background: (round1Data.showResults && winner === round1Data.player2) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.15)',
            border: (round1Data.showResults && winner === round1Data.player2) ? '2px solid #10b981' : '2px solid #a855f7',
            borderRadius: '1.5rem',
            padding: '2rem',
            textAlign: 'center',
            flex: 1,
            minHeight: '150px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: (round1Data.showResults && winner === round1Data.player2) ? '#10b981' : '#f3e8ff',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              {round1Data.player2}
            </h3>
            {round1Data.showResults && (
              <div style={{
                color: (winner === round1Data.player2) ? '#10b981' : '#c084fc',
                fontSize: '1.2rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Votes: {player2Votes}
              </div>
            )}
          </div>
        </div>

        {/* Skip votes button (only show when not showing results) */}
        {!round1Data.showResults && (
          <div style={{ marginTop: '2rem' }}>
            <Button
              style={{
                fontSize: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid #f87171',
                borderRadius: '0.75rem',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
              onClick={handleSkipVotes}
            >
              Skip Votes
            </Button>
          </div>
        )}

        {/* Voting status */}
        {!round1Data.showResults && (
          <div style={{
            marginTop: '2rem',
            color: '#c084fc',
            fontSize: '1.1rem',
            textAlign: 'center',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Waiting for players to vote...
          </div>
        )}
      </div>
      
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;800;900&display=swap" rel="stylesheet" />
    </div>
  );
};

export default MatchUpRoundView;
