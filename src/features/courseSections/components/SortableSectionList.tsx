import { SortableItem, SortableList } from "@/components/SortableList";
import { CourseSectionStatus } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { SectionFormDialog } from "./SectionFormDialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ActionButton";
import { Trash2Icon } from "lucide-react";
import { deleteSection } from "../action/sections";

export function SortableSectionList({
  courseId,
  sections,
}: {
  courseId: string;
  sections: {
    id: string;
    name: string;
    status: CourseSectionStatus;
  }[];
}) {
  return (
    <SortableList
      items={sections}
      onOrderChange={async () => {
        return { error: false, message: courseId };
      }}
    >
      {(items) =>
        items.map((section) => (
          <SortableItem
            key={section.id}
            id={section.id}
            className="flex items-center gap-1"
          >
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
          </SortableItem>
        ))
      }
    </SortableList>
  );
}
