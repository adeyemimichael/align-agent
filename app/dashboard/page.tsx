import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import CapacityScoreCircle from "@/components/CapacityScoreCircle";
import CapacityTrendChart from "@/components/CapacityTrendChart";
import MomentumIndicator from "@/components/MomentumIndicator";
import { Sparkles, TrendingUp, Calendar, Target, Zap } from "lucide-react";

export const runtime = 'nodejs';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkin?: string; score?: string; mode?: string }>;
}) {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const params = await searchParams;

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

  const showSuccessMessage = params.checkin === "success";
  const capacityScore = params.score ? parseFloat(params.score) : latestCheckIn?.capacityScore;
  const mode = params.mode || latestCheckIn?.mode;

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
    <DashboardLayout user={session.user} capacityScore={capacityScore}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session.user?.name?.split(' ')[0] || "User"}! 👋
            </h1>
            <p className="text-gray-600">
              {latestCheckIn
                ? "Here's your productivity overview"
                : "Start your day with a check-in to unlock AI-powered planning"}
            </p>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <p className="text-emerald-800 font-medium">
                Check-in completed! Your AI-powered plan is ready.
              </p>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Capacity Score Card */}
            {capacityScore !== null && capacityScore !== undefined ? (
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center border border-gray-200">
                <CapacityScoreCircle score={capacityScore} size={180} />
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
            ) : (
              <div className="lg:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center border border-emerald-200">
                <Sparkles className="w-16 h-16 text-emerald-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Check-in Yet</h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Complete your first check-in to unlock AI-powered planning
                </p>
                <Link
                  href="/checkin"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Start Check-in
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Mode */}
              {mode && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-gray-900">Current Mode</h3>
                  </div>
                  <span
                    className={`inline-block px-4 py-2 rounded-full border-2 font-medium text-sm ${getModeColor(
                      mode
                    )}`}
                  >
                    {getModeLabel(mode)}
                  </span>
                  <p className="mt-3 text-sm text-gray-600">
                    {getModeDescription(mode)}
                  </p>
                </div>
              )}

              {/* AI Plan */}
              <Link
                href="/plan"
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-6 border border-purple-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Today's AI Plan</h3>
                  <span className="ml-auto px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                    AI
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Get your personalized, capacity-aware schedule
                </p>
                <div className="text-emerald-600 font-medium text-sm group-hover:text-emerald-700">
                  View Plan →
                </div>
              </Link>

              {/* Analytics */}
              <Link
                href="/analytics"
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  View patterns, trends, and AI insights
                </p>
                <div className="text-emerald-600 font-medium text-sm group-hover:text-emerald-700">
                  View Analytics →
                </div>
              </Link>

              {/* Goals */}
              <Link
                href="/goals"
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900">Goals</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Manage your goals and track progress
                </p>
                <div className="text-emerald-600 font-medium text-sm group-hover:text-emerald-700">
                  Manage Goals →
                </div>
              </Link>
            </div>
          </div>

          {/* 7-Day Capacity Trend */}
          {checkInHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                7-Day Capacity Trend
              </h2>
              <CapacityTrendChart data={checkInHistory} />
            </div>
          )}

          {/* Momentum Indicator */}
          {latestCheckIn && (
            <div className="mb-6">
              <MomentumIndicator />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
