import type { Student, Application, Training, Evaluation, Notification } from '@/types';

export const MOCK_STUDENTS: Student[] = [
  {
    studentId: 'STU001',
    name: 'Aarav Patel',
    enrollmentNumber: '210001',
    email: 'aarav.patel@example.com',
    phone: '9876543210',
    contact: '9876543210',
    department: 'CSE',
    semester: 6,
    assignedCompany: 'Tech Solutions Inc.',
    avatar: 'https://i.pravatar.cc/150?u=aarav'
  },
  {
    studentId: 'STU002',
    name: 'Priya Sharma',
    enrollmentNumber: '210002',
    email: 'priya.sharma@example.com',
    phone: '9876543211',
    contact: '9876543211',
    department: 'IT',
    semester: 6,
    assignedCompany: 'DataSystems Ltd.',
    avatar: 'https://i.pravatar.cc/150?u=priya'
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    applicationId: 'APP001',
    studentId: 'STU001',
    assignedCellId: 'cse_cell',
    status: 'ASSIGNED',
    assignedDate: '2023-08-01T10:00:00Z'
  },
  {
    applicationId: 'APP002',
    studentId: 'STU002',
    assignedCellId: 'cse_cell',
    status: 'TRAINING_ACTIVE',
    assignedDate: '2023-08-05T10:00:00Z'
  }
];

export const MOCK_TRAININGS: Training[] = [
  {
    trainingId: 'TRN002',
    applicationId: 'APP002',
    studentId: 'STU002',
    assignedCellId: 'cse_cell',
    mentorName: 'Dr. Anita Desai',
    companySupervisor: 'Mr. John Doe',
    trainingModule: 'Full Stack Web Development',
    reportingLocation: 'Infosys Campus, Pune',
    joiningDate: '2023-08-10T10:00:00Z',
    reportingTime: '09:00 AM',
    duration: 6,
    status: 'ACTIVE'
  }
];

export const MOCK_EVALUATIONS: Evaluation[] = [];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    notificationId: 'NOT001',
    assignedCellId: 'cse_cell',
    type: 'NEW_ASSIGNMENT',
    title: 'New Student Assigned',
    message: 'Rahul Sharma has been assigned to your cell.',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];
