import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GetServerSidePropsContext } from 'next';
import { getServerSideProps } from '../pages/dev/design';

// The study is an isolated development surface, never a production game route.
describe('design study route', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does not expose the design study in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(await getServerSideProps({} as GetServerSidePropsContext)).toEqual({ notFound: true });
  });

  it('makes the study available in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(await getServerSideProps({} as GetServerSidePropsContext)).toEqual({ props: {} });
  });
});
