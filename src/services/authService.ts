import { useAuthStore } from '@/store/authStore';
import type { AuthSession, CellId } from '@/types';
import { api } from '@/lib/apiClient';

export interface LoginCredentials {
  cellId: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  session?: AuthSession;
}

/**
 * Coordinator authentication. Login/logout hit the real backend (JWT in
 * httpOnly cookies); session state is mirrored in the Zustand store for the UI.
 * Profile edits stay session-local because the `users` collection is owned by
 * the Admin Portal (the Coordinator never writes it).
 */
const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const session = await api.post<AuthSession>('/auth/login', {
        cellId: credentials.cellId,
        password: credentials.password,
      });
      useAuthStore.getState().setSession(session);
      return { success: true, session };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed.' };
    }
  },

  logout: (): void => {
    api.post('/auth/logout').catch(() => undefined);
    useAuthStore.getState().clearSession();
  },

  getSession: (): AuthSession | null => {
    return useAuthStore.getState().session;
  },

  isAuthenticated: (): boolean => {
    return useAuthStore.getState().isAuthenticated();
  },

  getCurrentCellId: (): CellId | null => {
    return useAuthStore.getState().getCellId();
  },

  getCurrentCell: async () => {
    const session = useAuthStore.getState().session;
    if (!session) return null;
    return {
      cellId: session.cellId,
      cellName: session.cellName,
      coordinatorName: session.coordinatorName,
      coordinatorEmail: session.coordinatorEmail,
      department: session.department ?? session.cellName,
    };
  },

  // Session-local only: the `users` collection is Admin-owned, so coordinator
  // profile edits are not persisted by this portal.
  updateCoordinatorProfile: async (updates: {
    coordinatorName: string;
    coordinatorEmail: string;
    coordinatorContact: string;
    notifications: boolean;
  }) => {
    const session = useAuthStore.getState().session;
    if (!session) return;
    useAuthStore.getState().setSession({
      ...session,
      coordinatorName: updates.coordinatorName,
      coordinatorEmail: updates.coordinatorEmail,
    });
    return Promise.resolve(true);
  },
};

export default authService;
