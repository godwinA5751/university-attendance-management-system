import { redirect } from "next/navigation";

export default function ChangePasswordIndexPage() {
  redirect("/auth/change-password");
}