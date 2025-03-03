import { PageHeader } from "@/components/ui/PageHeader";
import { CourseForm } from "@/features/courses/components/CourseForm";

export default function NewCoursesPage() {
  return (
    <div className="container my-6">
      <PageHeader title="New Courses" />
      <CourseForm />
    </div>
  );
}
