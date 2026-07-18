import type { Student } from '@/types';
import { MOCK_STUDENTS } from '@/mock/db';

const studentService = {
  getStudentsByCell: async (): Promise<Student[]> => {
    // Return all mock students
    return Promise.resolve([...MOCK_STUDENTS]);
  },

  getStudentById: async (studentId: string): Promise<Student | null> => {
    const student = MOCK_STUDENTS.find(s => s.studentId === studentId);
    return Promise.resolve(student || null);
  },

  searchStudents: async (query: string, department?: string, semester?: number): Promise<Student[]> => {
    const students = await studentService.getStudentsByCell();
    return students.filter(s => {
      const matchesQuery = !query || 
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
