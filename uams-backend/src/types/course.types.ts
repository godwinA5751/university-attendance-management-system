export interface CreateCourseInput{
  courseCode: string
  courseTitle: string
  unit: number
  semester: "First" | "Second"
  level: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  academicSessionId: string
}

export interface UpdateCourseInput {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  unit: number;
  semester: "First" | "Second";
  level: 100 | 200 | 300 | 400 | 500 | 600;
  academicSessionId: string;
}

export interface GetCoursesQuery {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  semester?: "First" | "Second";
  academicSessionId?: string;
}