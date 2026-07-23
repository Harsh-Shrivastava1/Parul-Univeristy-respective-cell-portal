import type { Application, ApplicationStatus } from '@/types';
import { api } from '@/lib/apiClient';

/**
 * Read-only view of applications assigned to the coordinator's cell (TEC-owned
 * collection). The coordinator-facing status is derived by the backend from the
 * owned training. The Coordinator NEVER writes the applications collection —
 * status changes flow from training events, so updateApplicationStatus is a
 * client-side no-op retained for call-site compatibility.
 */
const applicationService = {
  getApplicationsByCell: async (): Promise<Application[]> => {
    return api.get<Application[]>('/me/applications');
  },

  getApplicationById: async (applicationId: string): Promise<Application | null> => {
    try {
      return await api.get<Application>(`/applications/${applicationId}`);
    } catch {
      return null;
    }
  },

  // No-op: application status is projected from training events by the TEC
  // backend; the coordinator does not write applications.
  updateApplicationStatus: async (_applicationId: string, _status: ApplicationStatus): Promise<boolean> => {
    return Promise.resolve(true);
  },

  /**
   * Department command-writes (sanctioned exceptions): reject a student before
   * they join, or terminate after joining. Reason is mandatory; the student and
   * TEC are notified by the backend.
   */
  rejectStudent: async (applicationId: string, reason: string): Promise<void> => {
    await api.post(`/me/applications/${applicationId}/reject`, { reason });
  },

  terminateStudent: async (applicationId: string, reason: string): Promise<void> => {
    await api.post(`/me/applications/${applicationId}/terminate`, { reason });
  },

  /** Mark a JOINED internship as successfully completed (remarks mandatory). */
  completeInternship: async (applicationId: string, remarks: string): Promise<void> => {
    await api.post(`/me/applications/${applicationId}/complete-internship`, { remarks });
  },
};

export default applicationService;
