import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, CellId } from '@/types';

interface AuthStore {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
  getCellId: () => CellId | null;
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
    }),
    {
      name: 'pu_rcp_auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
);

