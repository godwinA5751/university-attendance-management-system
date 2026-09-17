import React from "react";
import { twMerge } from "tailwind-merge";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
  className = '',
}: PageHeaderProps) {
  return ( 
    <div className={twMerge("fixed top-8 right-8 left-22 lg:left-62 bg-white/10 backdrop-blur-md z-10 p-4 flex gap-4 items-center justify-between rounded-4xl", className)}>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  );
}