import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckInForm from "@/components/CheckInForm";

export const runtime = 'nodejs';

export default async function CheckInPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Daily Check-In
            </h1>
            <p className="text-lg text-gray-600">
              How are you feeling today? Let's assess your capacity.
            </p>
          </div>

          {/* Check-in Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <CheckInForm />
          </div>

          {/* Info Section */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Your check-in helps us create a realistic plan for your day based on your actual capacity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
