import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  icon: LucideIcon | string;
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  variant?: "primary" | "success" | "warning" | "error" | "info";
}

// CardContent component declared outside render to avoid recreation
function CardContent({
  Icon,
  title,
  value,
  subtitle,
  variant = "primary",
}: {
  Icon: LucideIcon | string;
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "primary" | "success" | "warning" | "error" | "info";
}) {
  const variantColors = {
    primary: "bg-primary-600",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    info: "bg-info",
  };

  return (
    <div className="card card-hover p-6">
      <div
        className={`w-12 h-12 rounded-xl ${variantColors[variant]} flex items-center justify-center mb-4 shadow-soft`}
      >
        {typeof Icon === "string" ? (
          <span className="text-2xl text-white">{Icon}</span>
        ) : (
          <Icon className="w-6 h-6 text-white" />
        )}
      </div>
      <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
        {value}
      </div>
      <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-neutral-500 dark:text-neutral-500">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function DashboardCard({
  icon: Icon,
  title,
  value,
  subtitle,
  href,
  variant = "primary",
}: DashboardCardProps) {
  if (href) {
    return (
      <Link href={href}>
        <CardContent
          Icon={Icon}
          title={title}
          value={value}
          subtitle={subtitle}
          variant={variant}
        />
      </Link>
    );
  }

  return (
    <CardContent
      Icon={Icon}
      title={title}
      value={value}
      subtitle={subtitle}
      variant={variant}
    />
  );
}
