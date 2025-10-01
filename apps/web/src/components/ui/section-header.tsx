import * as React from "react";
import { cn } from "@/lib/utils";
import { SectionTitle } from "./section-title";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  action?: React.ReactNode;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex justify-between items-center", className)}
      {...props}
    >
      <SectionTitle>{title}</SectionTitle>
      {action}
    </div>
  )
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader };