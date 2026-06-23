export interface LoginInput {
  role: "student" | "lecturer" | "admin";
  identifier: string;
  password: string;
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};