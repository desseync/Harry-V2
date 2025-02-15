import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const authRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/auth/callback`;

// Enhanced validation with detailed checks and unmasked debugging
const validateConfig = () => {
  const issues: string[] = [];

  if (!supabaseUrl) {
    issues.push('VITE_SUPABASE_URL is missing');
  } else {
    // Ensure URL starts with https://
    if (!supabaseUrl.startsWith('https://')) {
      issues.push('VITE_SUPABASE_URL must start with https://');
    }
    // Ensure URL ends with .supabase.co
    if (!supabaseUrl.endsWith('.supabase.co')) {
      issues.push('VITE_SUPABASE_URL must end with .supabase.co');
    }
  }

  if (!supabaseAnonKey) {
    issues.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (supabaseAnonKey.length < 20) {
    issues.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }

  if (issues.length > 0) {
    console.error('Supabase Configuration Errors:', issues);
  } else {
    console.log('Supabase Configuration Validated: All variables are correct.');
  }

  return issues.length === 0;
};

// Get the appropriate redirect URL
const getRedirectUrl = () => authRedirectUrl;

// Ensure URL has https:// prefix
const getFormattedUrl = (url: string) => (url.startsWith('https://') ? url : `https://${url}`);

// Create Supabase client with enhanced error handling
export const supabase = validateConfig()
  ? createClient(getFormattedUrl(supabaseUrl), supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        flowType: 'pkce',
        redirectTo: getRedirectUrl(),
      },
      global: {
        headers: { 'x-client-info': 'frequency-ai-web' },
      },
      db: {
        schema: 'public',
      },
    })
  : null;

// Export helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  if (!supabase) {
    // Log detailed error in development
    if (import.meta.env.DEV) {
      console.error('Supabase Configuration Status:', {
        VITE_SUPABASE_URL: supabaseUrl || 'Not Found',
        VITE_SUPABASE_ANON_KEY: supabaseAnonKey || 'Not Found',
        VITE_AUTH_REDIRECT_URL: authRedirectUrl || 'Not Found',
        urlValid: supabaseUrl?.startsWith('https://') && supabaseUrl?.endsWith('.supabase.co'),
      });
    }
    return false;
  }
  return true;
};

// Debug check - log Supabase client status
console.log('Supabase Client Debugging:');
console.log('VITE_SUPABASE_URL:', supabaseUrl || 'Not Found');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey || 'Not Found');
console.log('VITE_AUTH_REDIRECT_URL:', authRedirectUrl || 'Not Found');

if (!supabase) {
  throw new Error('Supabase client is not initialized properly. Check your environment variables.');
}
