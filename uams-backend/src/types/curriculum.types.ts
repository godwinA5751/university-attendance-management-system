export interface CreateCurriculumInput {
  curriculumName: string;
  year: number;
}

export interface UpdateCurriculumInput {
  curriculumName?: string;
  year?: number;
}