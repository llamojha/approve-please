import BriefingScreen from './BriefingScreen';
import GameOverScreen from './GameOverScreen';
import SummaryScreen from './SummaryScreen';
import WorkScreen from './WorkScreen';
import { useGameState } from '../../context/GameContext';

const GameView = () => {
  const {
    state: { phase }
  } = useGameState();

  if (phase === 'BRIEFING') {
    return <BriefingScreen />;
  }

  if (phase === 'WORK') {
    return <WorkScreen />;
  }

  if (phase === 'SUMMARY') {
    return <SummaryScreen />;
  }

  return <GameOverScreen />;
};

export default GameView;
