import React from "react";
import { useSidebar } from "@/components/ui/sidebar";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  const { state } = useSidebar();
  const maxW = state === "collapsed" ? "max-w-7xl" : "max-w-6xl";
  return (
    <div className={`${maxW} mx-auto w-full ${className ?? ""}`}>{children}</div>
  );
}
