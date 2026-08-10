interface FormActionsProps {
  children: React.ReactNode;
}

export default function FormActions({
  children,
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      {children}
    </div>
  );
}