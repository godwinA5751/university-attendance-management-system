export interface User {
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    mustChangePassword: boolean;
  };
}