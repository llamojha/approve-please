import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key };
};

const createCachedClient = (() => {
  let serviceClient: SupabaseClient | null = null;

  return (): SupabaseClient | null => {
    const { url, key } = getEnv();
    if (!url || !key) {
      return null;
    }
    if (!serviceClient) {
      serviceClient = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
    }
    return serviceClient;
  };
})();

export const getSupabaseServiceClient = (): SupabaseClient | null => createCachedClient();
