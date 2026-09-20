import type { Evaluation } from '@/types';
import { api } from '@/lib/apiClient';

/** Thin client for training evaluations (embedded on the owned training). */
const evaluationService = {
  getEvaluationsByCell: async (): Promise<Evaluation[]> => {
    return api.get<Evaluation[]>('/me/evaluations');
  },

  /**
   * A student who trains here twice has two evaluations, so matching on the
   * student alone returns whichever came back first. Look one up by the
   * application it belongs to.
   */
  getEvaluationByApplication: async (applicationId: string): Promise<Evaluation | null> => {
    const all = await evaluationService.getEvaluationsByCell();
    return all.find((e) => e.applicationId === applicationId) || null;
  },

  submitEvaluation: async (
    evaluation: Omit<Evaluation, 'evaluationId' | 'submittedAt'>
  ): Promise<Evaluation | null> => {
    return api.post<Evaluation>(`/trainings/${evaluation.trainingId}/evaluation`, evaluation);
  },
};

export default evaluationService;
