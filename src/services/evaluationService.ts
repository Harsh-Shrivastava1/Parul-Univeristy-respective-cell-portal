import type { Evaluation } from '@/types';
import { MOCK_EVALUATIONS } from '@/mock/db';

const evaluationService = {
  getEvaluationsByCell: async (): Promise<Evaluation[]> => {
    return Promise.resolve([...MOCK_EVALUATIONS]);
  },

  getEvaluationByStudent: async (studentId: string): Promise<Evaluation | null> => {
    const evaluation = MOCK_EVALUATIONS.find(e => e.studentId === studentId);
    return Promise.resolve(evaluation || null);
  },

  submitEvaluation: async (evaluation: Omit<Evaluation, 'evaluationId' | 'submittedAt'>): Promise<Evaluation | null> => {
    const newEvaluation: Evaluation = {
      ...evaluation,
      evaluationId: `EVAL${Math.floor(Math.random() * 1000)}`,
      submittedAt: new Date().toISOString()
    };
    MOCK_EVALUATIONS.push(newEvaluation);
    return Promise.resolve(newEvaluation);
  }
};

export default evaluationService;
