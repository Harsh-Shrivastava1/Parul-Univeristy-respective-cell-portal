import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, CellId } from '@/types';

interface AuthStore {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
  getCellId: () => CellId | null;
  getUserId: () => string | null;
  getDepartment: () => string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,

      setSession: (session) => set({ session }),

      clearSession: () => set({ session: null }),

      isAuthenticated: () => {
        const s = get().session;
        return !!(s && s.isAuthenticated);
      },

      getCellId: () => {
        const s = get().session;
        return s ? s.cellId : null;
      },

      /** Returns the MongoDB _id of the authenticated user */
      getUserId: () => {
        const s = get().session;
        return s?.userId ?? null;
      },

      /** Returns the department from the users collection (stored in JWT) */
      getDepartment: () => {
        const s = get().session;
        return s?.department ?? null;
      },
    }),
    {
      name: 'pu_rcp_auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
);

