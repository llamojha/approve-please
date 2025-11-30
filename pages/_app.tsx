import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import Head from 'next/head';
import { SITE_METADATA } from '../constants/siteMetadata';
import { GameProvider } from '../context/GameContext';
import { UIPreferencesProvider } from '../context/UIPreferencesContext';
import { LocaleProvider } from '../context/LocaleContext';
import '../styles/globals.css';
import HydrationErrorBoundary from '../components/common/HydrationErrorBoundary';
import type { GameMode } from '../types';

type NextPageWithMode<P = {}, IP = P> = NextPage<P, IP> & { pageMode?: GameMode };

type AppPropsWithMode = AppProps & { Component: NextPageWithMode };

export default function App({ Component, pageProps }: AppPropsWithMode) {
  const socialImageUrl = `${SITE_METADATA.url}${SITE_METADATA.image}`;
  const pageMode = Component.pageMode ?? 'game';

  return (
    <LocaleProvider>
      <UIPreferencesProvider>
        <GameProvider mode={pageMode} key={pageMode}>
          <Head>
          <title>{SITE_METADATA.title}</title>
          <meta name="description" content={SITE_METADATA.description} />
          {SITE_METADATA.keywords.length > 0 && (
            <meta name="keywords" content={SITE_METADATA.keywords.join(', ')} />
          )}
          <meta name="author" content={SITE_METADATA.author} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content={SITE_METADATA.themeColor} />
          <link rel="canonical" href={SITE_METADATA.url} />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
          <link rel="icon" sizes="any" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icon-512.png" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={SITE_METADATA.siteName} />
          <meta property="og:title" content={SITE_METADATA.title} />
          <meta property="og:description" content={SITE_METADATA.description} />
          <meta property="og:url" content={SITE_METADATA.url} />
          <meta property="og:locale" content={SITE_METADATA.locale} />
          <meta property="og:image" content={socialImageUrl} />
          <meta property="og:image:alt" content={SITE_METADATA.imageAlt} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={SITE_METADATA.title} />
          <meta name="twitter:description" content={SITE_METADATA.description} />
          <meta name="twitter:image" content={socialImageUrl} />
          {SITE_METADATA.twitterHandle ? (
            <meta name="twitter:creator" content={SITE_METADATA.twitterHandle} />
          ) : null}
        </Head>
          <HydrationErrorBoundary>
            <Component {...pageProps} />
          </HydrationErrorBoundary>
        </GameProvider>
      </UIPreferencesProvider>
    </LocaleProvider>
  );
}
