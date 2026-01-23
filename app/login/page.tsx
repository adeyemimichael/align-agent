import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export const runtime = 'nodejs';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // Redirect to dashboard if already authenticated
  if (session) {
    redirect(params.callbackUrl || "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="w-full max-w-md">
        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </div>
  );
}
