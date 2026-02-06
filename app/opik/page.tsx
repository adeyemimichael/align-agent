'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import OpikDashboard from '@/components/OpikDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OpikPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Performance Dashboard</h1>
            <p className="text-gray-600">
              Track AI decision quality, reasoning accuracy, and system performance
            </p>
          </div>

          <OpikDashboard />
        </div>
      </div>
    </DashboardLayout>
  );
}
