"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, VideoIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

/**
 * CoursePageClient 함수는 특정 강좌 페이지를 렌더링합니다.
 * 이 함수는 아코디언 컴포넌트를 사용하여 강좌의 섹션과 강의들을 표시합니다.
 * 현재 강의를 강조하고, 완료된 강의에는 완료 아이콘을 표시합니다.
 *
 * @param {Object} props - 속성 객체.
 * @param {Object} props.course - 강좌 정보를 포함하는 객체.
 * @param {string} props.course.id - 강좌 ID.
 * @param {Array} props.course.courseSections - 강좌 섹션 배열.
 * @param {string} props.course.courseSections[].id - 강좌 섹션 ID.
 * @param {string} props.course.courseSections[].name - 강좌 섹션 이름.
 * @param {Array} props.course.courseSections[].lessons - 섹션 내의 강의 배열.
 * @param {string} props.course.courseSections[].lessons[].id - 강의 ID.
 * @param {string} props.course.courseSections[].lessons[].name - 강의 이름.
 * @param {boolean} props.course.courseSections[].lessons[].isComplete - 강의 완료 여부.
 */
export function CoursePageClient({
  course,
}: {
  course: {
    name: string;
    id: string;
    courseSections: {
      id: string;
      name: string;
      lessons: {
        id: string;
        name: string;
        isComplete: boolean;
      }[];
    }[];
  };
}) {
  const { lessonId } = useParams();

  const defaultValue =
    typeof lessonId === "string"
      ? course.courseSections.find((section) =>
          section.lessons.find((lesson) => lesson.id === lessonId)
        )
      : course.courseSections[0];

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultValue?.id ? [defaultValue.id] : undefined}
      className="space-y-2"
    >
      {course.courseSections.map((section) => (
        <AccordionItem
          key={section.id}
          value={section.id}
          className="border-none bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/10"
        >
          <AccordionTrigger className="text-lg font-medium px-4 py-3 hover:no-underline">
            {section.name}
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-3">
            <div className="space-y-1">
              {section.lessons.map((lesson) => (
                <Button
                  variant="ghost"
                  key={lesson.id}
                  className={cn(
                    "w-full justify-start px-3 py-2 rounded-lg transition-all duration-200",
                    lesson.id === lessonId
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10"
                  )}
                >
                  <Link
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="flex items-center w-full"
                  >
                    <VideoIcon className="w-4 h-4 mr-2 text-white/70" />
                    <span className="text-white/90">{lesson.name}</span>
                    {lesson.isComplete && (
                      <CheckCircle2Icon className="ml-auto w-4 h-4 text-green-400" />
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
