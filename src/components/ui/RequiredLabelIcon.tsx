import { cn } from "@/lib/utils";
import { AsteriskIcon } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";

export function RequiredLabelIcon({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AsteriskIcon>) {
  // console.log(props, "----------------------");
  return (
    <AsteriskIcon
      {...props}
      className={cn("text-destructive inline size-4 align-top", className)}
    />
  );
}
