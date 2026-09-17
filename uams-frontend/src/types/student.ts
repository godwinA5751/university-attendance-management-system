export interface Student {
  _id: string;

  firstName: string;
  middleName?: string;
  lastName: string;

  matricNumber: string;

  department: string;
  faculty: string;

  currentLevel: number;
  admissionYear: number;
  curriculumId: string;
}

export type CreateStudentInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  matricNumber: string;
  department: string;
  faculty: string;
  currentLevel: number;
  admissionYear: number;
  curriculumId: string;
  carryOverCourseIds?: string[];
};

export type UpdateStudentInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  department?: string;
  faculty?: string;
};

export type PromoteStudentInput = {
  newLevel: number;
  carryOverCourseIds?: string[];
};

export interface StudentProfile {
  firstName: string;
  middleName?: string;
  lastName: string;
  role: string;
  matricNumber: string;
  department: string;
  faculty: string;
  currentLevel: number;
  admissionYear: number;
  curriculumId: string;
}