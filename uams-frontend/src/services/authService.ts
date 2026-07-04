import api from "@/lib/axios";

export const getCurrentUser = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};