import * as React from "react";
import { cn } from "@/lib/utils";
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col h-full bg-background border-r", className)}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";
export { Sidebar };