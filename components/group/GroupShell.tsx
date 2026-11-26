import type { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import BrandMark from '../common/BrandMark';
import { useLocale } from '../../context/LocaleContext';
import { useUIPreferences } from '../../context/UIPreferencesContext';
import { useTranslations } from '../../hooks/useTranslations';
import live from '../../styles/LiveDesk.module.css';

export function GroupShell({children}:{children:ReactNode}) {
  const {locale,setLocale}=useLocale();
  const {theme,toggleTheme}=useUIPreferences();
  const translations=useTranslations();const t=translations.group;
  return <div className={live.shell} data-dark={theme==='githob-dark'}>
    <Head><title>{`${t.nav} · Approve Please`}</title><meta name="robots" content="noindex,nofollow" /></Head>
    <header className={live.topbar}><Link className={live.brand} href="/" aria-label={t.home}><span aria-hidden="true"><BrandMark /></span>approve<strong>please</strong><b>.</b></Link>
      <div className={live.topActions}><Link href="/group">{t.nav}</Link><button type="button" onClick={toggleTheme} aria-label={translations.designStudy.theme}>{theme==='githob-dark'?'☀':'◐'}</button><button type="button" onClick={()=>setLocale(locale==='en'?'es':'en')}>{locale.toUpperCase()} ↔</button></div>
    </header>{children}
  </div>;
}
