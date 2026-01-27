import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProgressTracker } from '@/components/ProgressTracker';
import DashboardLayout from '@/components/DashboardLayout';

export default async function ProgressPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/login');
  }

  // Get today's plan
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const plan = await prisma.dailyPlan.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (!plan) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Progress Tracking
          </h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 mb-4">
              No plan found for today. Create a plan to start tracking progress.
            </p>
            <a
              href="/plan"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Generate Plan
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Real-Time Progress Tracking
          </h1>
          <p className="text-gray-600 mt-2">
            Track your progress throughout the day and stay on top of your schedule
          </p>
        </div>

        <ProgressTracker planId={plan.id} autoRefresh={true} />
      </div>
    </DashboardLayout>
  );
}
