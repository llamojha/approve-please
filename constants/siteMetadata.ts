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
    'Step into Release Ops, review pull requests under pressure, and balance stability, speed, and team trust.',
  url: 'https://approve-please.amllamojha.com',
  image: '/social-card.jpg',
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
