export interface CreateLecturerInput{
  firstName: string;
  middleName?: string | undefined;
  lastName: string;
  staffNumber: string;
  department: string;
  faculty: string;
}

export interface UpdateLecturerInput {
  firstName: string;
  middleName?: string | undefined;
  lastName: string;
  department: string;
  faculty: string;
}