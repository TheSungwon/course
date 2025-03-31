import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { ReactNode } from "react";

export function SkeletonButton({ className }: { className?: string }) {
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

export function SkeletonArray({
  amount,
  children,
}: {
  amount: number;
  children: ReactNode;
}) {
  return Array.from({ length: amount }).map(() => children);
}

export function SkeletonText({
  rows = 1,
  size = "md",
  className,
}: {
  rows?: number;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <SkeletonArray amount={rows}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-gray-200 rounded",
              rows > 1 && "last:w3-/4",
              size === "md" && "h-3",
              size === "lg" && "h-5",
              className
            )}
          />
        ))}
      </SkeletonArray>
    </div>
  );
}
