import type { Training } from '@/types';
import { api } from '@/lib/apiClient';

export interface StartTrainingPayload {
  applicationId: string;
  studentId: string;
  assignedCellId: 'cse_cell' | 'it_cell' | 'hr_cell' | 'mechanical_cell' | 'civil_cell';
  mentorName: string;
  trainingModule: string;
  reportingLocation: string;
  joiningDate: string;
  reportingTime: string;
  duration: number;
}

/**
 * Thin client for the Coordinator-owned trainings collection. Emails /
 * notifications and the cross-portal application-status projection are handled
 * server-side (the training document state change is the business event).
 */
const trainingService = {
  getTrainingsByCell: async (): Promise<Training[]> => {
    return api.get<Training[]>('/me/trainings');
  },

  getActiveTrainings: async (): Promise<Training[]> => {
    const all = await trainingService.getTrainingsByCell();
    return all.filter((t) => t.status === 'ACTIVE');
  },

  getCompletedTrainings: async (): Promise<Training[]> => {
    const all = await trainingService.getTrainingsByCell();
    return all.filter((t) => t.status === 'COMPLETED');
  },

  getTrainingByApplicationId: async (applicationId: string): Promise<Training | null> => {
    const all = await trainingService.getTrainingsByCell();
    return all.find((t) => t.applicationId === applicationId) || null;
  },

  getTrainingByStudentId: async (studentId: string): Promise<Training | null> => {
    const all = await trainingService.getTrainingsByCell();
    return all.find((t) => t.studentId === studentId) || null;
  },

  startTraining: async (payload: StartTrainingPayload): Promise<Training | null> => {
    return api.post<Training>('/trainings', payload);
  },

  /** Bulk-assign a mentor to several students at once (by application id). */
  assignMentor: async (
    applicationIds: string[],
    mentorName: string,
  ): Promise<{ assigned: number; mentorName: string }> => {
    return api.post<{ assigned: number; mentorName: string }>('/trainings/assign-mentor', {
      applicationIds,
      mentorName,
    });
  },

  completeTraining: async (trainingId: string): Promise<boolean> => {
    await api.post(`/trainings/${trainingId}/complete`);
    return true;
  },
};

export default trainingService;
