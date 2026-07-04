export function getDashboardRoute(role: string) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";

    case "lecturer":
      return "/lecturer/dashboard";

    case "student":
      return "/student/dashboard";

    default:
      return "/login";
  }
}