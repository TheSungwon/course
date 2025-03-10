"use client";
import { SortableItem, SortableList } from "@/components/SortableList";
import { LessonStatus } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ActionButton";
import { Trash2Icon, VideoIcon } from "lucide-react";
import { LessonFormDialog } from "./LessonFormDialog";

export function SortableLessonList({
  sections,
  lessons,
}: {
  sections: {
    id: string;
    name: string;
  }[];
  lessons: {
    name: string;
    id: string;
    status: LessonStatus;
    description: string | null;
    youtubeVideoId: string;
    sectionId: string;
  }[];
}) {
  return (
    <SortableList items={lessons} onOrderChange={updateLessonOrders}>
      {(items) =>
        items.map((lesson) => (
          <SortableItem
            key={lesson.id}
            id={lesson.id}
            className="flex items-center gap-1 w-full"
          >
            <div
              className={cn(
                "contents",
                lesson.status === "private" && "text-muted-foreground"
              )}
            >
              <div className="size-4 my-4">
                {lesson.status === "private" ? "🔐" : ""}
              </div>
              <div className="size-4 my-4">
                {lesson.status === "preview" && <VideoIcon />}
              </div>
              <div className="hover:font-extrabold">{lesson.name}</div>
            </div>
            <LessonFormDialog lesson={lesson} sections={sections}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto transition duration-500 hover:-translate-y-2 hover:scale-110"
                >
                  Edit
                </Button>
              </DialogTrigger>
            </LessonFormDialog>
            <ActionButton
              variant="destructiveOutline"
              requireAreYouSure
              action={deletelesson.bind(null, lesson.id)}
              size="sm"
            >
              <Trash2Icon />
              <span className="sr-only">Delete</span>
            </ActionButton>
          </SortableItem>
        ))
      }
    </SortableList>
  );
}
