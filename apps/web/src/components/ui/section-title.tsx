import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const SectionTitle = React.forwardRef<HTMLHeadingElement, SectionTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-sm font-normal text-foreground", className)}
      {...props}
    />
  )
);
SectionTitle.displayName = "SectionTitle";

export { SectionTitle };