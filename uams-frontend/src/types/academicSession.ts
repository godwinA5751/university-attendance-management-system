export interface AcademicSession {
  _id: string;
  sessionName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSessionResponse {
  message: string;
  data: AcademicSession[];
}

export interface CreateAcademicSessionInput {
  sessionName: string;
  startDate: string;
  endDate: string;
}