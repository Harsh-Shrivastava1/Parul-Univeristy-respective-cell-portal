import type { Evaluation } from '@/types';
import { api } from '@/lib/apiClient';

/** Thin client for training evaluations (embedded on the owned training). */
const evaluationService = {
  getEvaluationsByCell: async (): Promise<Evaluation[]> => {
    return api.get<Evaluation[]>('/me/evaluations');
  },

  getEvaluationByStudent: async (studentId: string): Promise<Evaluation | null> => {
    const all = await evaluationService.getEvaluationsByCell();
    return all.find((e) => e.studentId === studentId) || null;
  },

  submitEvaluation: async (
    evaluation: Omit<Evaluation, 'evaluationId' | 'submittedAt'>
  ): Promise<Evaluation | null> => {
    return api.post<Evaluation>(`/trainings/${evaluation.trainingId}/evaluation`, evaluation);
  },
};

export default evaluationService;
