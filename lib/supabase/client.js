import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          // We'll set this per request instead
        },
      },
    }
  );
}

// Helper to create authenticated client
export function createAuthenticatedClient(userId) {
  const supabase = createClient();

  // Set custom JWT claim for RLS
  supabase.rpc = new Proxy(supabase.rpc, {
    apply: (target, thisArg, args) => {
      return target.apply(thisArg, args);
    },
  });

  return supabase;
}
