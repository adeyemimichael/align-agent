import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import CapacityTrendChart from '@/components/CapacityTrendChart';
import OpikDashboard from '@/components/OpikDashboard';
import TimeBlindnessInsights from '@/components/TimeBlindnessInsights';
import { TrendingUp, TrendingDown, Minus, Brain, Target, Zap } from 'lucide-react';

export const runtime = 'nodejs';

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/login');
  }

  // Get latest check-in for capacity score
  const latestCheckIn = await prisma.checkIn.findFirst({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
  });

  // Get 30-day history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const history = await prisma.checkIn.findMany({
    where: {
      userId: user.id,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: 'desc' },
  });

  // Calculate statistics
  const avgCapacity = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.capacityScore, 0) / history.length)
    : 0;

  const avgEnergy = history.length > 0
    ? (history.reduce((sum, h) => sum + h.energyLevel, 0) / history.length).toFixed(1)
    : '0';

  const avgSleep = history.length > 0
    ? (history.reduce((sum, h) => sum + h.sleepQuality, 0) / history.length).toFixed(1)
    : '0';

  const avgStress = history.length > 0
    ? (history.reduce((sum, h) => sum + h.stressLevel, 0) / history.length).toFixed(1)
    : '0';

  // Determine trend
  const recentHistory = history.slice(0, 7);
  const olderHistory = history.slice(7, 14);
  
  const recentAvg = recentHistory.length > 0
    ? recentHistory.reduce((sum, h) => sum + h.capacityScore, 0) / recentHistory.length
    : 0;
  
  const olderAvg = olderHistory.length > 0
    ? olderHistory.reduce((sum, h) => sum + h.capacityScore, 0) / olderHistory.length
    : 0;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentAvg > olderAvg + 5) trend = 'improving';
  else if (recentAvg < olderAvg - 5) trend = 'declining';

  const getTrendIcon = () => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-emerald-600" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend === 'improving') return 'text-emerald-600 bg-emerald-50';
    if (trend === 'declining') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <DashboardLayout user={session.user} capacityScore={latestCheckIn?.capacityScore}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
            <p className="text-gray-600">
              Track your capacity patterns and AI performance metrics
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Capacity</span>
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgCapacity}</div>
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium px-2 py-1 rounded-full ${getTrendColor()}`}>
                {getTrendIcon()}
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Energy</span>
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgEnergy}</div>
              <div className="text-sm text-gray-500 mt-2">out of 10</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Sleep</span>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgSleep}</div>
              <div className="text-sm text-gray-500 mt-2">out of 10</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Stress</span>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgStress}</div>
              <div className="text-sm text-gray-500 mt-2">out of 10</div>
            </div>
          </div>

          {/* Capacity Trend Chart */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">30-Day Capacity Trend</h2>
              <CapacityTrendChart data={history.slice(0, 30)} />
            </div>
          )}

          {/* Time Blindness Insights - THE KILLER FEATURE */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⏱️ Time Tracking & Learning</h2>
            <TimeBlindnessInsights />
          </div>

          {/* AI Performance Metrics */}
          <OpikDashboard />

          {/* Insights */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🧠 AI-Powered Insights</h3>
            <div className="space-y-3 text-sm text-gray-700">
              {trend === 'improving' && (
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Your capacity is trending upward! Keep up the good habits.</span>
                </p>
              )}
              {trend === 'declining' && (
                <p className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">!</span>
                  <span>Your capacity has been declining. Consider focusing on recovery activities.</span>
                </p>
              )}
              {parseFloat(avgStress as string) > 7 && (
                <p className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">!</span>
                  <span>Your stress levels are high. The AI will prioritize lighter tasks in your daily plans.</span>
                </p>
              )}
              {parseFloat(avgEnergy as string) > 7 && (
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Your energy levels are excellent! Perfect time for deep work and challenging tasks.</span>
                </p>
              )}
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">ℹ</span>
                <span>The AI learns from your patterns to provide increasingly accurate recommendations over time.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
