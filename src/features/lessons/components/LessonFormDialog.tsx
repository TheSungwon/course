"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LessonStatus } from "@/drizzle/schema";
import { ReactNode, useState } from "react";
import { LessonForm } from "./LessonForm";

export function LessonFormDialog({
  sections,
  defaultSectionId,
  lesson,
  children,
}: {
  defaultSectionId?: string;
  children: ReactNode;
  sections: {
    id: string;
    name: string;
  }[];
  lesson?: {
    name: string;
    id: string;
    status: LessonStatus;
    description: string | null;
    youtubeVideoId: string;
    sectionId: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {lesson == null ? "New Lesson" : `Edit ${lesson.name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <LessonForm
            sections={sections}
            lesson={lesson}
            defaultSectionId={defaultSectionId ?? ""}
            onSuccess={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
