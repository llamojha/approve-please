import { createClient, SupabaseClient } from '@supabase/supabase-js';

type SupabaseKind = 'service' | 'anon';

const getEnv = (kind: SupabaseKind) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    kind === 'service' ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
};

const createCachedClient = (() => {
  let serviceClient: SupabaseClient | null = null;
  let anonClient: SupabaseClient | null = null;

  return (kind: SupabaseKind): SupabaseClient | null => {
    const { url, key } = getEnv(kind);
    if (!url || !key) {
      return null;
    }
    if (kind === 'service') {
      if (!serviceClient) {
        serviceClient = createClient(url, key, {
          auth: { autoRefreshToken: false, persistSession: false }
        });
      }
      return serviceClient;
    }
    if (!anonClient) {
      anonClient = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
    }
    return anonClient;
  };
})();

export const getSupabaseServiceClient = (): SupabaseClient | null => createCachedClient('service');
export const getSupabaseAnonClient = (): SupabaseClient | null => createCachedClient('anon');
