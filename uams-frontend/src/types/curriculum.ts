export interface Curriculum {
  _id: string;
  curriculumName: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumResponse {
  message: string;
  data: Curriculum[];
}

export interface CreateCurriculumInput {
  curriculumName: string;
  year: number;
}

export interface UpdateCurriculumInput {
  curriculumName?: string;
  year?: number;
}