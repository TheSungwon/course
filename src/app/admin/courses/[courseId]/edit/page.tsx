import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/drizzle/db";
import { CourseSectionTable, CourseTable, LessonTable } from "@/drizzle/schema";
import { CourseForm } from "@/features/courses/components/CourseForm";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { SectionFormDialog } from "@/features/courseSections/components/SectionFormDialog";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { asc, eq } from "drizzle-orm";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionButton } from "@/components/ActionButton";
import { deleteSection } from "@/features/courseSections/action/sections";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (course == null) return notFound();

  return (
    <div className="container my-6">
      <PageHeader title={course.name} />
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="lessons">
          Lessons
          <Card>
            <CardHeader className="flex items-center flex-row justify-between">
              <CardTitle>Sections</CardTitle>
              <SectionFormDialog courseId={course.id}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusIcon />
                    New Section
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>
            <CardContent>
              {course.courseSections.map((section) => (
                <div className="flex items-center gap-1" key={section.id}>
                  <div
                    className={cn(
                      "contents",
                      section.status === "private" && "text-muted-foreground"
                    )}
                  >
                    <div className="size-4 my-4">
                      {section.status === "private" ? "🔐" : "🔓"}
                    </div>
                    <div className="">{section.name}</div>
                  </div>
                  <SectionFormDialog section={section} courseId={course.id}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto transition duration-500 hover:-translate-y-2 hover:scale-110"
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                  </SectionFormDialog>
                  <ActionButton
                    variant="destructiveOutline"
                    requireAreYouSure
                    action={deleteSection.bind(null, section.id)}
                  >
                    <Trash2Icon />
                    <span className="sr-only">Delete</span>
                  </ActionButton>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          Details
          <Card>
            <CardHeader>
              <CourseForm course={course} />
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.CourseTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
    },
    where: eq(CourseTable.id, id),
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        columns: {
          id: true,
          name: true,
          status: true,
        },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            columns: {
              id: true,
              name: true,
              status: true,
              description: true,
              youtubeVideoId: true,
              sectionId: true,
            },
          },
        },
      },
    },
  });
}
