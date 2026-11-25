import { Curriculum } from "../models/Curriculum.js";
import type {
  CreateCurriculumInput,
  UpdateCurriculumInput,
} from "../types/curriculum.types.js";
import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";

export const createCurriculum = async (
  data: CreateCurriculumInput
) => {
  const existingCurriculum =
    await Curriculum.findOne({
      curriculumName: data.curriculumName,
    });

  if (existingCurriculum) {
    throw new Error(
      "Curriculum already exists"
    );
  }

  const curriculum =
    await Curriculum.create(data);

  return curriculum;
};

export const getAllCurricula = async () => {
  return Curriculum.find()
    .sort({
      year: -1,
      createdAt: -1,
    });
};

export const getCurriculumById = async (
  curriculumId: string
) => {
  const curriculum =
    await Curriculum.findById(
      curriculumId
    );

  if (!curriculum) {
    throw new Error(
      "Curriculum not found"
    );
  }

  return curriculum;
};

export const updateCurriculum = async (
  curriculumId: string,
  data: UpdateCurriculumInput
) => {
  const curriculum =
    await Curriculum.findByIdAndUpdate(
      curriculumId,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!curriculum) {
    throw new Error(
      "Curriculum not found"
    );
  }

  return curriculum;
};

export const deleteCurriculum = async (
  curriculumId: string
) => {
  const curriculum = await Curriculum.findById(curriculumId);

  if (!curriculum) {
    throw new Error("Curriculum not found");
  }

  const [studentsExist, coursesExist] = await Promise.all([
    Student.exists({ curriculumId }),
    Course.exists({ curriculumId }),
  ]);

  if (studentsExist || coursesExist) {
    throw new Error(
      "Cannot delete a curriculum that has students or courses assigned to it."
    );
  }

  await curriculum.deleteOne();

  return { message: "Curriculum deleted successfully" };
};