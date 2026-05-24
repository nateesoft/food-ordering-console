'use client';
import React from 'react';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ icon, title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10">{icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-indigo-100 text-sm mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
