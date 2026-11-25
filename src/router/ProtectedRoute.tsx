import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/** How often a returning tab re-reads /auth/me at most. */
const RECHECK_MS = 60_000;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = useAuthStore(state => state.session);
  const verified = useAuthStore(state => state.verified);
  const location = useLocation();
  const lastCheck = useRef(0);
  const hasSession = !!session?.isAuthenticated;

  // The session lives in localStorage and used to be trusted as is, so the
  // portal stayed "logged in" after the cookies had expired. Confirm it with
  // the server on load, and again when the coordinator returns to the tab.
  useEffect(() => {
    if (!hasSession) return;
    const check = () => {
      lastCheck.current = Date.now();
      void authService.verifySession();
    };
    if (!useAuthStore.getState().verified) check();
    const onReturn = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastCheck.current >= RECHECK_MS) check();
    };
    window.addEventListener('focus', onReturn);
    document.addEventListener('visibilitychange', onReturn);
    return () => {
      window.removeEventListener('focus', onReturn);
      document.removeEventListener('visibilitychange', onReturn);
    };
  }, [hasSession]);

  if (!hasSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!verified) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
