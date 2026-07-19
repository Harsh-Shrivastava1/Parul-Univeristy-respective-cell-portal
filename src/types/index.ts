// ============================================================
// PARUL UNIVERSITY – RESPECTIVE CELL PORTAL
// Shared TypeScript Types
// ============================================================

export type CellId = 'cse_cell' | 'it_cell' | 'hr_cell' | 'mechanical_cell' | 'civil_cell';

export type ApplicationStatus =
  | 'ASSIGNED'
  | 'TRAINING_ACTIVE'
  | 'TRAINING_COMPLETED'
  | 'RETURNED_TO_TEC';



export type NotificationType =
  | 'NEW_ASSIGNMENT'
  | 'TRAINING_COMPLETION'
  | 'GENERAL';

export interface Student {
  studentId: string;
  name: string;
  enrollmentNumber: string;
  email: string;
  phone: string;
  contact: string;
  department: string;
  semester: number;
  assignedCompany: string;
  assignedMentor?: string;
  avatar?: string;
}

export interface Application {
  applicationId: string;
  studentId: string;
  assignedCellId: CellId;
  status: ApplicationStatus;
  assignedDate: string;
}

export interface Training {
  trainingId: string;
  applicationId: string;
  studentId: string;
  assignedCellId: CellId;
  mentorName: string;
  companySupervisor: string;
  trainingModule: string;
  reportingLocation: string;
  joiningDate: string;
  reportingTime: string;
  duration: number; // in weeks or days
  status: 'ASSIGNED' | 'ACTIVE' | 'COMPLETED';
}



export interface Evaluation {
  evaluationId: string;
  trainingId: string;
  studentId: string;
  applicationId: string;
  communication: number; // 1-10
  technicalSkills: number; // 1-10
  punctuality: number; // 1-10
  overallPerformance: number; // 1-10
  remarks: string;
  submittedAt: string;
}

export interface Notification {
  notificationId: string;
  assignedCellId: CellId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthSession {
  userId?: string;
  cellId: CellId;
  cellName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  department?: string;
  role?: string;
  isAuthenticated: boolean;
  loginTime: string;
  token?: string;
}
