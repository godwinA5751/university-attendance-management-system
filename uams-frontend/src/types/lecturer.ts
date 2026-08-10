export interface AssignLecturer {
  _id: string;
  lecturerName: string;
  staffNumber: string;
  department: string;
  faculty: string;
}

export interface Lecturer {
  _id: string;
  firstName: string;
  lastName: string;
  staffNumber: string;
  department: string;
  faculty: string;
}

export type CreateLecturerInput = {
  firstName: string;
  lastName: string;
  staffNumber: string;
  department: string;
  faculty: string;
};

export type UpdateLecturerInput = {
  firstName: string;
  lastName: string;
  department: string;
  faculty: string;
};

export type GetLecturersParams = {
  page?: number;
  limit?: number;
  search?: string;
};