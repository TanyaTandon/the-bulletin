
import { createClient } from '@supabase/supabase-js';

// Create a mock Supabase client that doesn't do anything
// This prevents errors when Supabase isn't properly configured
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: {}, error: null }),
    signInWithPassword: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null })
  },
  from: () => ({
    select: () => ({ 
      order: () => ({
        data: [],
        error: null
      })
    }),
    insert: () => ({ error: null })
  })
};

// Use the mock client instead of trying to connect to Supabase
export const supabase = mockSupabase as unknown as ReturnType<typeof createClient>;

// Export a flag indicating Supabase isn't properly configured
export const isSupabaseConfigured = false;
