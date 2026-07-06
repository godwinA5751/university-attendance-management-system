export interface AcademicSession {
  _id: string;
  sessionName: string;
}

export interface Lecturer {
  _id: string;
  lecturerName: string;
  department: string;
}

export interface Course {
  _id: string;
  courseCode: string;
  courseTitle: string;
  unit: number;
  semester: "First" | "Second";
  level: number;

  academicSessionId: AcademicSession;

  lecturers: Lecturer[];
}

export interface CreateCourseInput {
  courseCode: string;
  courseTitle: string;
  unit: number;
  semester: "First" | "Second";
  level: number;
  academicSessionId: string;
}

// export interface UpdateCourseInput
//   extends CreateCourseInput {}
// 
export type UpdateCourseInput = Partial<CreateCourseInput>;