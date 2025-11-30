import type { NextPage } from 'next';
import GameView from '../components/screens/GameView';
import type { GameMode } from '../types';

type TutorialPageComponent = NextPage & { pageMode?: GameMode };

const TutorialPage: TutorialPageComponent = () => {
  return <GameView />;
};

TutorialPage.pageMode = 'tutorial';

export default TutorialPage;
