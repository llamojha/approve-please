import BriefingScreen from '../components/screens/BriefingScreen';
import GameOverScreen from '../components/screens/GameOverScreen';
import SummaryScreen from '../components/screens/SummaryScreen';
import WorkScreen from '../components/screens/WorkScreen';
import { useGameState } from '../context/GameContext';

const GamePage = () => {
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

export default GamePage;
