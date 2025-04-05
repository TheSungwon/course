export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const data = await params;
  console.log(data, "ddddddddddddddd");

  return (
    <div className="flex flex-col">
      <p>Course ID: {data.courseId}</p>
      <p>Lesson ID: {data.lessonId}</p>
    </div>
  );
}
