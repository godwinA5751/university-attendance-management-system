import axios from "@/lib/axios";
import {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
} from "@/types/course";

export interface GetCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  semester?: "First" | "Second";
  academicSessionId?: string;
}

export const getCourses = async (
  params?: GetCoursesParams
) => {
  const res = await axios.get("/courses", {
    params,
  });

  return res.data;
};

export const getCourse = async (
  id: string
) => {
  const res = await axios.get(`/courses/${id}`);

  return res.data.data as Course;
};

export const createCourse = async (
  data: CreateCourseInput
) => {
  const res = await axios.post(
    "/courses",
    data
  );

  return res.data.data;
};

export const updateCourse = async (
  id: string,
  data: UpdateCourseInput
) => {
  const res = await axios.patch(
    `/courses/${id}`,
    data
  );

  return res.data.data;
};

export const deleteCourse = async (
  id: string
) => {
  await axios.delete(`/courses/${id}`);
};