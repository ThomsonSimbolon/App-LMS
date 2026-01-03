import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    // Crypto/SaaS style semantic badge variants - using solid colors for better contrast
    const variants = {
      default:
        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200",
      primary: "bg-primary-500 text-white",
      success: "bg-success text-white",
      warning: "bg-warning text-white",
      error: "bg-error text-white",
      info: "bg-info text-white",
    };

    return (
      <span
        ref={ref}
        className={cn("badge", variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
