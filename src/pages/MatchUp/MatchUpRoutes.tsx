import React from 'react';
import MatchUpEntry from './MatchUpEntry';
import MatchUpHostScreen from './MatchUpHostScreen';
import MatchUpRoundView from './MatchUpRoundView';
import MatchUpJoin from './MatchUpJoin';
import MatchUpPlayer from './MatchUpPlayer';
import { Routes, Route } from 'react-router-dom';

const MatchUpRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MatchUpEntry />} />
      <Route path="join/:gameId" element={<MatchUpJoin />} />
      <Route path=":gameId/host" element={<MatchUpHostScreen />} />
      <Route path=":gameId/host/round/:roundNumber" element={<MatchUpRoundView />} />
      <Route path=":gameId/:playerName" element={<MatchUpPlayer />} />
    </Routes>
  );
};

export default MatchUpRoutes;
