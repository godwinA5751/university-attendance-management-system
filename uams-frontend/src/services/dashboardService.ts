import api from "@/lib/axios";
import { DashboardData, DashboardResponse } from "@/types/dashboard";

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get<DashboardResponse>(
    "/api/analytics/dashboard"
  );

  return response.data.data;
};