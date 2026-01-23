import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import CheckInForm from "@/components/CheckInForm";
import { Activity, Brain, Heart, Moon } from "lucide-react";

export const runtime = 'nodejs';

export default async function CheckInPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Check-In
          </h1>
          <p className="text-gray-600">
            How are you feeling today? Let's assess your capacity.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Energy</p>
                <p className="text-sm text-blue-900">Physical vitality</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium">Sleep</p>
                <p className="text-sm text-purple-900">Rest quality</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium">Stress</p>
                <p className="text-sm text-orange-900">Mental load</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">Mood</p>
                <p className="text-sm text-emerald-900">Emotional state</p>
              </div>
            </div>
          </div>
        </div>

        {/* Check-in Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <CheckInForm />
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                AI-Powered Capacity Assessment
              </p>
              <p className="text-sm text-blue-700">
                Your check-in data helps our AI create a realistic daily plan based on your actual capacity. 
                We'll automatically adjust your schedule to match your energy levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
