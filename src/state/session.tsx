/**
 * Sign-in state. The token is kept in SecureStore (web: localStorage) so farmers stay signed
 * in between launches; an expired or revoked token signs them out.
 */
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { ApiError, session as tokenStore } from '@/services/api-client';
import { DEMO_MODE } from '@/services/demo-mode';
import { fetchMe, signIn as apiSignIn, toProfile, type ApiUser } from '@/services/farmer-api';
import { DEMO_PROFILE } from '@/services/farmer-api-demo';
import type { FarmerProfile } from '@/types/farmer';

type SessionState = {
  status: 'loading' | 'signedOut' | 'signedIn';
  profile: FarmerProfile | null;
  signIn: (phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Demo mode only (development builds): enter the app as the sample farmer, no sign-in. */
  continueInDemo: (() => void) | null;
};

const SessionContext = createContext<SessionState | null>(null);

const STAFF_MESSAGE = 'This app is for farmers. Staff should use the AgriTrust web dashboard.';

export function SessionProvider({ children }: { children: ReactNode }) {
  // Demo mode starts signed in as the sample farmer — no token, no backend.
  const [status, setStatus] = useState<SessionState['status']>(DEMO_MODE ? 'signedIn' : 'loading');
  const [profile, setProfile] = useState<FarmerProfile | null>(DEMO_MODE ? DEMO_PROFILE : null);

  const signOut = async () => {
    await tokenStore.clear();
    setProfile(null);
    setStatus('signedOut');
  };

  const accept = (user: ApiUser) => {
    setProfile(toProfile(user));
    setStatus('signedIn');
  };

  useEffect(() => {
    if (DEMO_MODE) return;
    tokenStore.setUnauthorizedHandler(() => void signOut());
    let cancelled = false;
    (async () => {
      if (!(await tokenStore.load())) {
        if (!cancelled) setStatus('signedOut');
        return;
      }
      try {
        const user = await fetchMe();
        if (cancelled) return;
        if (user.role === 'farmer') accept(user);
        else await signOut();
      } catch (error) {
        if (cancelled) return;
        // Server unreachable at launch: show sign-in but keep the token for the next launch.
        if (error instanceof ApiError && error.status === 0) setStatus('signedOut');
        else await signOut();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (phone: string, password: string) => {
    const { access_token, user } = await apiSignIn(phone.trim(), password);
    if (user.role !== 'farmer') throw new ApiError(403, STAFF_MESSAGE);
    await tokenStore.save(access_token);
    accept(user);
  };

  const continueInDemo = DEMO_MODE
    ? () => {
        setProfile(DEMO_PROFILE);
        setStatus('signedIn');
      }
    : null;

  return (
    <SessionContext value={{ status, profile, signIn, signOut, continueInDemo }}>
      {children}
    </SessionContext>
  );
}

export function useSession() {
  const ctx = use(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
