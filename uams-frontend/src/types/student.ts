export interface Student {
  _id: string;

  firstName: string;
  lastName: string;

  matricNumber: string;

  department: string;
  faculty: string;

  currentLevel: number;
  admissionYear: number;
}

export type CreateStudentInput = {
  firstName: string;
  lastName: string;
  matricNumber: string;
  department: string;
  faculty: string;
  currentLevel: number;
  admissionYear: number;
  carryOverCourseIds?: string[];
};

export type UpdateStudentInput = {
  firstName: string;
  lastName: string;
  department?: string;
  faculty?: string;
};

export type PromoteStudentInput = {
  newLevel: number;
  carryOverCourseIds?: string[];
};