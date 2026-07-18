import type { Training } from '@/types';
import { MOCK_TRAININGS } from '@/mock/db';
import emailService from './emailService';

export interface StartTrainingPayload {
  applicationId: string;
  studentId: string;
  assignedCellId: 'cse_cell' | 'it_cell' | 'hr_cell' | 'mechanical_cell' | 'civil_cell';
  mentorName: string;
  companySupervisor: string;
  trainingModule: string;
  reportingLocation: string;
  joiningDate: string;
  reportingTime: string;
  duration: number;
}

const trainingService = {
  getTrainingsByCell: async (): Promise<Training[]> => {
    return Promise.resolve([...MOCK_TRAININGS]);
  },

  getActiveTrainings: async (): Promise<Training[]> => {
    return Promise.resolve(MOCK_TRAININGS.filter(t => t.status === 'ACTIVE'));
  },

  getCompletedTrainings: async (): Promise<Training[]> => {
    return Promise.resolve(MOCK_TRAININGS.filter(t => t.status === 'COMPLETED'));
  },

  getTrainingByApplicationId: async (applicationId: string): Promise<Training | null> => {
    const training = MOCK_TRAININGS.find(t => t.applicationId === applicationId);
    return Promise.resolve(training || null);
  },

  getTrainingByStudentId: async (studentId: string): Promise<Training | null> => {
    const training = MOCK_TRAININGS.find(t => t.studentId === studentId);
    return Promise.resolve(training || null);
  },

  startTraining: async (payload: StartTrainingPayload): Promise<Training | null> => {
    const newTraining: Training = {
      ...payload,
      trainingId: `TRN${Math.floor(Math.random() * 1000)}`,
      status: 'ACTIVE'
    };
    MOCK_TRAININGS.push(newTraining);
    
    // Trigger mock email
    await emailService.sendTrainingStartedEmail(`${payload.studentId}@example.com`);
    
    return Promise.resolve(newTraining);
  },

  completeTraining: async (trainingId: string): Promise<boolean> => {
    const training = MOCK_TRAININGS.find(t => t.trainingId === trainingId);
    if (training) {
      training.status = 'COMPLETED';
      // Trigger mock email to TEC and Admin
      await emailService.sendTrainingCompletedEmail(
        `${training.studentId}@example.com`,
        'tec_cell@paruluniversity.ac.in',
        'admin@paruluniversity.ac.in'
      );
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
};

export default trainingService;
