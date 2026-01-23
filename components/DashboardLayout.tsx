'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  capacityScore?: number;
}

export default function DashboardLayout({ children, user, capacityScore }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} capacityScore={capacityScore} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
