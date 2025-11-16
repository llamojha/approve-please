export interface SiteMetadata {
  title: string;
  shortTitle: string;
  siteName: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  keywords: string[];
  themeColor: string;
  author: string;
  locale: string;
  twitterHandle?: string;
}

export const SITE_METADATA: SiteMetadata = {
  title: 'Approve Please – Pull Request Sim',
  shortTitle: 'Approve Please',
  siteName: 'Approve Please',
  description:
    'Step into Release Ops, review GitHub PRs under pressure, and balance stability, speed, and stakeholder satisfaction.',
  url: 'https://approveplease.dev',
  image: '/social-card.png',
  imageAlt: 'Approve Please - Pull Request Review simulator showing a pull request queue and status meters.',
  keywords: [
    'Approve Please',
    'code review game',
    'pull request simulator',
    'Devops',
    'software stability'
  ],
  themeColor: '#0f172a',
  author: 'Alvaro Llamojha',
  locale: 'en_US'
};
