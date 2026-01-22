import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const runtime = 'nodejs';

export default async function Home() {
  const session = await auth();

  //Redirect to dashboard if already authenticated
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-16">
        {/* Logo and Navigation */}
        <div className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Align <span className="text-emerald-600">AI</span>
            </span>
          </div>
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
            ✨ Your AI Productivity Partner
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Achieve your yearly goals,{" "}
            <span className="text-emerald-600">sustainably</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            Meet your AI productivity agent that helps you win at your goals—this year 
            and every year after. It learns your patterns, respects your limits, and 
            plans your day around how you actually feel, so you can make real progress 
            without burning out.
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link
              href="/login"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-lg shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="bg-white hover:bg-gray-50 text-emerald-600 font-semibold px-8 py-4 rounded-lg border-2 border-emerald-600 transition-colors duration-200 text-lg"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="max-w-5xl mx-auto mb-16 bg-white rounded-2xl p-10 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              You're not broken. Your tools are.
            </h2>
            <p className="text-xl text-gray-600">
              Most productivity apps treat you like a robot with infinite energy. 
              They don't care if you're exhausted, stressed, or running on 4 hours of sleep—
              and that's why your goals stay out of reach.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Impossible Expectations
              </h3>
              <p className="text-sm text-gray-600">
                Your to-do list stays the same whether you slept 4 hours or 8
              </p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Burnout by Design
              </h3>
              <p className="text-sm text-gray-600">
                Pushing through low-energy days until you crash completely
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Goals That Never Happen
              </h3>
              <p className="text-sm text-gray-600">
                Another year ends with the same unfinished goals from last year
              </p>
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your AI agent that helps you actually win
          </h2>
          <p className="text-xl text-gray-600">
            Align AI checks in with you every morning, understands your capacity, 
            and creates a realistic plan for your day. It connects daily tasks to your 
            yearly goals, learns your patterns, and helps you make consistent progress—
            so you can finally achieve what matters most.
          </p>
        </div>

        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-emerald-600"
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
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Morning Check-In
            </h3>
            <p className="text-gray-600">
              Tell your AI agent how you're feeling—energy, sleep quality, stress, 
              and mood. Takes 30 seconds. No judgment, just data.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your AI Plans Your Day
            </h3>
            <p className="text-gray-600">
              Powered by Google Gemini, your agent creates a realistic daily plan 
              based on your capacity, priorities, and past patterns. See exactly 
              why it made each decision.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Three Modes, One Goal
            </h3>
            <p className="text-gray-600">
              Recovery mode when you're drained. Balanced mode for normal days. 
              Deep Work mode when you're energized. Your agent picks the right one.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              It Learns You
            </h3>
            <p className="text-gray-600">
              Your agent tracks 7-day patterns and learns what works for you. 
              Plans get smarter over time, not more demanding.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Syncs with Your Life
            </h3>
            <p className="text-gray-600">
              Connects with Google Calendar and Todoist. Your agent schedules 
              tasks when you have the capacity to actually do them.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Connect to Your Goals
            </h3>
            <p className="text-gray-600">
              Set your yearly goals and watch your agent break them down into daily 
              progress. Every task connects to what you want to achieve this year.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to win at your goals this year?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Your AI productivity agent is waiting to help you achieve what matters—
            sustainably, consistently, and without burnout.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-emerald-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg shadow-lg"
          >
            Start Your First Check-In
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Align AI · Your productivity partner for achieving yearly goals, year after year.
          </p>
        </div>
      </div>
    </main>
  );
}
