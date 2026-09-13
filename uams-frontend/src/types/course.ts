export interface Curriculum {
  _id: string;
  curriculumName: string;
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

  curriculumId: Curriculum;

  lecturers: Lecturer[];
}

export interface CreateCourseInput {
  courseCode: string;
  courseTitle: string;
  unit: number;
  semester: "First" | "Second";
  level: number;
  curriculumId: string;
}

// export interface UpdateCourseInput
//   extends CreateCourseInput {}
// 
export type UpdateCourseInput = Partial<CreateCourseInput>;