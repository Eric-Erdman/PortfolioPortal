
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';

import { GameView } from './pages/GameView';
import GamePlayerView from './pages/GamePlayerView';
import SmartJoin from './pages/SmartJoin';

import { Dashboard } from './pages/Dashboard';
import { CryptographyDashboard } from './pages/Cryptography';
import { AimlDashboard } from './pages/AIML';
import { NotesToQuizMain } from './pages/AIML/NotesToQuiz/NotesToQuizMain';
import { AudioVisualizer } from './pages/AudioVisualizer';
import { ImposterGame } from './pages/Imposter';

import MatchUpRoutes from './pages/MatchUp/MatchUpRoutes';


function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/game/:gameId" element={<GameView />} />
          <Route path="/game/catan/:playerName" element={<GamePlayerView />} />
          <Route path="/join/:gameId" element={<SmartJoin />} />
          <Route path="/game/matchup/*" element={<MatchUpRoutes />} />
          <Route path="/cryptography" element={<CryptographyDashboard />} />
          <Route path="/cryptography/:showcaseId" element={<CryptographyDashboard />} />
          <Route path="/aiml" element={<AimlDashboard />} />
          <Route path="/aiml/notes-to-quiz" element={<NotesToQuizMain onBack={() => window.history.back()} />} />
          <Route path="/audio-visualizer" element={<AudioVisualizer />} />
          <Route path="/imposter" element={<ImposterGame />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
