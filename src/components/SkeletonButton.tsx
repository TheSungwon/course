import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export function SkeletonButton({ className }: { className: string }) {
  return (
    <div
      className={cn(
        buttonVariants({
          variant: "outline",
          className: "pointer-events-none animate-pulse w-24 shadow-md",
        }),
        className
      )}
    >
      loading...
    </div>
  );
}
