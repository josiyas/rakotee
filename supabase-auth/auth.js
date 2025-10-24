// Shared Supabase auth helpers for Rakotee frontend
// IMPORTANT: replace SUPABASE_URL and SUPABASE_ANON_KEY with your project's values

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// The Supabase JS UMD exposes createClient on the global `supabase` object when loaded via CDN.
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.RakoteeAuth = {
  signUp: async (email, password) => {
    const { data, error } = await client.auth.signUp({ email, password });
    return { data, error };
  },
  signIn: async (email, password) => {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    return { data, error };
  },
  signOut: async () => {
    const { error } = await client.auth.signOut();
    return { error };
  },
  sendReset: async (email, redirectTo) => {
    const { data, error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    return { data, error };
  },
  getUser: async () => {
    const {
      data: { user }
    } = await client.auth.getUser();
    return user;
  }
};
