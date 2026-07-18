import type { Application, ApplicationStatus } from '@/types';
import { MOCK_APPLICATIONS } from '@/mock/db';

const applicationService = {
  getApplicationsByCell: async (): Promise<Application[]> => {
    return Promise.resolve([...MOCK_APPLICATIONS]);
  },

  getApplicationById: async (applicationId: string): Promise<Application | null> => {
    const app = MOCK_APPLICATIONS.find(a => a.applicationId === applicationId);
    return Promise.resolve(app || null);
  },

  updateApplicationStatus: async (applicationId: string, status: ApplicationStatus): Promise<boolean> => {
    const app = MOCK_APPLICATIONS.find(a => a.applicationId === applicationId);
    if (app) {
      app.status = status;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
};

export default applicationService;
