export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  matricNumber: string;
  department: string;
  faculty: string;
  currentLevel: number;
  admissionYear: number;
  carryOverCourseIds?: string[];
}