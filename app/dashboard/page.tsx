import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CapacityScoreCircle from "@/components/CapacityScoreCircle";
import CapacityTrendChart from "@/components/CapacityTrendChart";

export const runtime = 'nodejs';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { checkin?: string; score?: string; mode?: string };
}) {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Get latest check-in
  let latestCheckIn = null;
  let checkInHistory: any[] = [];
  if (user) {
    latestCheckIn = await prisma.checkIn.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    // Get 7-day history for trend chart
    checkInHistory = await prisma.checkIn.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 7,
    });
  }

  const showSuccessMessage = searchParams.checkin === "success";
  const capacityScore = searchParams.score ? parseFloat(searchParams.score) : latestCheckIn?.capacityScore;
  const mode = searchParams.mode || latestCheckIn?.mode;

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "recovery":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "deep_work":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "recovery":
        return "Recovery Mode";
      case "deep_work":
        return "Deep Work Mode";
      default:
        return "Balanced Mode";
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case "recovery":
        return "Focus on rest and lighter tasks to prevent burnout";
      case "deep_work":
        return "Perfect time for demanding, high-value work";
      default:
        return "Balance between challenging tasks and recovery";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {session.user?.name || "User"}!
            </h1>
            <p className="text-gray-600">
              {latestCheckIn
                ? "Here's your current capacity status"
                : "Start your day with a check-in"}
            </p>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-800 font-medium">
                ✓ Check-in completed successfully!
              </p>
            </div>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Capacity Score Card */}
            {capacityScore !== null && capacityScore !== undefined && (
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center">
                <CapacityScoreCircle score={capacityScore} size={200} />
                <div className="mt-6 text-center">
                  <div className="text-sm text-gray-500 mb-2">
                    Last updated
                  </div>
                  <div className="text-gray-700 font-medium">
                    {latestCheckIn
                      ? new Date(latestCheckIn.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : "Today"}
                  </div>
                </div>
              </div>
            )}

            {/* Mode and Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Mode Card */}
              {mode && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Current Mode
                  </h2>
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <span
                        className={`inline-block px-4 py-2 rounded-full border-2 font-medium text-lg ${getModeColor(
                          mode
                        )}`}
                      >
                        {getModeLabel(mode)}
                      </span>
                      <p className="mt-4 text-gray-600">
                        {getModeDescription(mode)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Check-in Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Daily Check-In
                </h2>
                <p className="text-gray-600 mb-6">
                  {latestCheckIn
                    ? "Update your check-in to reflect how you're feeling now"
                    : "Complete your first check-in to get started"}
                </p>
                <Link
                  href="/checkin"
                  className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {latestCheckIn ? "Update Check-In" : "Start Check-In"}
                </Link>
              </div>
            </div>
          </div>

          {/* Today's Metrics (if check-in exists) */}
          {latestCheckIn && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Today's Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {latestCheckIn.energyLevel}
                  </div>
                  <div className="text-sm text-gray-500">Energy Level</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${(latestCheckIn.energyLevel / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {latestCheckIn.sleepQuality}
                  </div>
                  <div className="text-sm text-gray-500">Sleep Quality</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(latestCheckIn.sleepQuality / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {latestCheckIn.stressLevel}
                  </div>
                  <div className="text-sm text-gray-500">Stress Level</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(latestCheckIn.stressLevel / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {latestCheckIn.mood === 'positive' ? '😊' : latestCheckIn.mood === 'negative' ? '😔' : '😐'}
                  </div>
                  <div className="text-sm text-gray-500">Mood</div>
                  <div className="mt-2 text-sm font-medium text-gray-700 capitalize">
                    {latestCheckIn.mood}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7-Day Capacity Trend */}
          {checkInHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                7-Day Capacity Trend
              </h2>
              <CapacityTrendChart data={checkInHistory} />
            </div>
          )}

          {/* Coming Soon */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">AI-Powered Daily Plans</div>
                  <div className="text-sm text-gray-500">Get intelligent task prioritization with Gemini AI</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Calendar Integration</div>
                  <div className="text-sm text-gray-500">Sync with Google Calendar for time blocking</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Task Management</div>
                  <div className="text-sm text-gray-500">Integrate with Todoist, Notion, and Linear</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/goals"
              className="inline-flex items-center px-6 py-3 bg-white text-emerald-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Manage Your Goals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
