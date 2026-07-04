import Link from "next/link";
export default function StudentsPage() {
  return (
    <div>
      <h1>Students</h1>
      <Link href="/admin/students/new">
        <button>Add Student</button>
      </Link>
    </div>
  );
}