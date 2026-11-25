import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import GamePage from './game';
import { useGameState } from '../context/GameContext';
import { useLocale } from '../context/LocaleContext';
import { basicsCopy } from '../constants/basicsCopy';
import { SITE_METADATA } from '../constants/siteMetadata';

/** The actual game, with a different content track and its own saved run. */
export default function BasicsGamePage() {
  const router = useRouter();
  const { actions: { setDifficulty } } = useGameState();
  const { locale } = useLocale();
  useEffect(() => {
    if (router.isReady) setDifficulty(router.query.difficulty === 'normal' ? 'normal' : 'learning');
  }, [router.isReady, router.query.difficulty, setDifficulty]);
  return <><Head><title>{`${basicsCopy[locale].name} · Approve Please`}</title><link key="canonical" rel="canonical" href={`${SITE_METADATA.url}/learn`} /></Head><GamePage /></>;
}
