import { useCallback } from 'react';
import { signIn, signOut } from "@auth/create/react";

// Type definitions
interface SignInOptions {
  callbackUrl?: string;
  [key: string]: any;
}

interface UseAuthReturn {
  signInWithCredentials: (options?: SignInOptions) => Promise<any>;
  signUpWithCredentials: (options?: SignInOptions) => Promise<any>;
  signInWithGoogle: (options?: SignInOptions) => Promise<any>;
  signInWithFacebook: (options?: SignInOptions) => Promise<any>;
  signInWithTwitter: (options?: SignInOptions) => Promise<any>;
  signOut: typeof signOut;
}

function useAuth(): UseAuthReturn {
  const callbackUrl = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  const signInWithCredentials = useCallback((options: SignInOptions = {}) => {
    return signIn("credentials-signin", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl]);

  const signUpWithCredentials = useCallback((options: SignInOptions = {}) => {
    return signIn("credentials-signup", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl]);

  const signInWithGoogle = useCallback((options: SignInOptions = {}) => {
    return signIn("google", {
      ...options,
      callbackUrl: callbackUrl ?? options.callbackUrl
    });
  }, [callbackUrl]);

  const signInWithFacebook = useCallback((options: SignInOptions = {}) => {
    return signIn("facebook", options);
  }, []);

  const signInWithTwitter = useCallback((options: SignInOptions = {}) => {
    return signIn("twitter", options);
  }, []);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut,
  };
}

export default useAuth;