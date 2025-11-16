import type { AppProps } from 'next/app';
import Head from 'next/head';
import { GameProvider } from '../context/GameContext';
import { UIPreferencesProvider } from '../context/UIPreferencesContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UIPreferencesProvider>
      <GameProvider>
        <Head>
          <title>Approve Please</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </GameProvider>
    </UIPreferencesProvider>
  );
}
