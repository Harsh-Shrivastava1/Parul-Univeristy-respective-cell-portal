import { useAuthStore } from '@/store/authStore';
import type { AuthSession, CellId } from '@/types';

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

const MOCK_SESSION: AuthSession = {
  userId: 'mock-user-123',
  cellId: 'cse_cell',
  cellName: 'Computer Science Engineering Cell',
  coordinatorName: 'Jane Doe',
  coordinatorEmail: 'jane.doe@paruluniversity.ac.in',
  department: 'Computer Science',
  role: 'COORDINATOR',
  isAuthenticated: true,
  loginTime: new Date().toISOString(),
  token: 'mock-token-abc-123',
};

const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (credentials.cellId.trim().toLowerCase() === 'admin' && credentials.password.trim() === 'password') {
      useAuthStore.getState().setSession(MOCK_SESSION);
      return { success: true, session: MOCK_SESSION };
    }
    return { success: false, error: 'Invalid credentials. Use admin/password' };
  },

  logout: (): void => {
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
    
    // In a real app, this would hit an API.
    return Promise.resolve(true);
  },
};

export default authService;
