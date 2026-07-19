import type { Student } from '@/types';
import { api } from '@/lib/apiClient';

/** Read-only assigned-student data (Student-owned collection, cell-scoped). */
const studentService = {
  getStudentsByCell: async (): Promise<Student[]> => {
    return api.get<Student[]>('/me/students');
  },

  getStudentById: async (studentId: string): Promise<Student | null> => {
    try {
      return await api.get<Student>(`/students/${studentId}`);
    } catch {
      return null;
    }
  },

  searchStudents: async (query: string, department?: string, semester?: number): Promise<Student[]> => {
    const students = await studentService.getStudentsByCell();
    return students.filter((s) => {
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.enrollmentNumber.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase());
      const matchesDept = !department || s.department === department;
      const matchesSem = !semester || s.semester === semester;
      return matchesQuery && matchesDept && matchesSem;
    });
  },
};

export default studentService;
