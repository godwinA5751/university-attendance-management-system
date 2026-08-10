import { FormHTMLAttributes } from "react";

interface FormSectionProps
  extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export default function FormSection({
  children,
  className = "",
  ...props
}: FormSectionProps) {
  return (
    <form
      {...props}
      className={`space-y-5 ${className}`}
    >
      {children}
    </form>
  );
}