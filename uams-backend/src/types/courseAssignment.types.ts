export interface AssignLecturersInput {
  courseId: string;
  lecturerIds: string[];
}

export interface ReplaceLecturersInput {
  courseId: string;
  lecturerIds: string[];
}

export interface RemoveLecturerInput {
  courseId: string;
  lecturerId: string;
}