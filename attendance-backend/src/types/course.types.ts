export interface CreateCourseInput{
  courseCode: string
  courseTitle: string
  unit: number
  semester: "First" | "Second"
  level: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  lecturerIds?: string[]
}

export interface AssignLecturersInput {
  courseId: string;
  lecturerIds: string[];
}

export interface ReplaceLecturersInput {
  courseId: string;
  lecturerIds: string[];
}