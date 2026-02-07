import LoginForm from "@/components/LoginForm";

export const runtime = 'nodejs';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  // Note: Session check removed to prevent database connection errors
  // If user is already logged in, they can navigate to dashboard manually

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="w-full max-w-md">
        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </div>
  );
}
