export interface MatchUpGame {
  id: string;
  hostName: string;
  playerNames: string[];
  currentRound: number;
  maxRounds: number;
  answers: Record<string, string[]>;
  votes: Record<string, Record<string, string>>;
  scores: Record<string, number>;
  status: 'waiting' | 'playing' | 'finished';
}

export interface MatchUpPlayer {
  name: string;
  gameId: string;
  isHost: boolean;
}