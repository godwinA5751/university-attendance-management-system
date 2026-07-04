export default interface InputField {
  label: string;
  name: "currentPassword" | "newPassword" | "confirmPassword";
  type: string;
};