export interface LoginInput {
  identifier: string;
  password: string;
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};