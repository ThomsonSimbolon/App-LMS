import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  icon: LucideIcon | string;
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  gradient?: string;
}

export function DashboardCard({
  icon: Icon,
  title,
  value,
  subtitle,
  href,
  gradient = 'from-primary-500 to-accent-500',
}: DashboardCardProps) {
  const CardContent = () => (
    <div className="card card-hover p-6">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20`}>
        {typeof Icon === 'string' ? (
          <span className="text-2xl">{Icon}</span>
        ) : (
          <Icon className="w-6 h-6 text-white" />
        )}
      </div>
      <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        {title}
      </div>
      {subtitle && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          {subtitle}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
