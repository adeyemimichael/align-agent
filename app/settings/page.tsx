import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import SettingsClient from '@/components/SettingsClient';

export const runtime = 'nodejs';

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      checkIns: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });

  const capacityScore = user?.checkIns[0]?.capacityScore;

  return (
    <DashboardLayout user={session.user} capacityScore={capacityScore}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <SettingsClient user={session.user} />
      </div>
    </DashboardLayout>
  );
}
