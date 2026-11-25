import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, CellId } from '@/types';
import { SESSION_EXPIRED } from '@/lib/apiClient';

interface AuthStore {
  session: AuthSession | null;
  /**
   * The saved session has been confirmed with the server in this tab. The
   * session is kept in localStorage, so on its own it says nothing about
   * whether the cookies behind it are still good.
   */
  verified: boolean;
  /** The last session ended on its own; the login page says so. */
  expired: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
  getCellId: () => CellId | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      verified: false,
      expired: false,

      setSession: (session) => set({ session, verified: true, expired: false }),

      clearSession: () => set({ session: null, verified: false }),

      isAuthenticated: () => {
        const s = get().session;
        return !!(s && s.isAuthenticated);
      },

      getCellId: () => {
        const s = get().session;
        return s ? s.cellId : null;
      },
    }),
    {
      name: 'pu_rcp_auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
);

// The API client could not renew the session (expired, or the account was
// deleted or deactivated): drop it. ProtectedRoute then redirects to /login.
window.addEventListener(SESSION_EXPIRED, () => {
  if (useAuthStore.getState().session) {
    useAuthStore.setState({ session: null, verified: false, expired: true });
  }
});
