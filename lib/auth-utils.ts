import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";

/**
 * Validates that a user is authenticated for API routes
 * Returns the session if authenticated, or an error response if not
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
      session: null as Session | null,
    };
  }

  return {
    error: null,
    session: session as Session,
  };
}

/**
 * Wrapper for API route handlers that require authentication
 */
export function withAuth<T extends Response | NextResponse>(
  handler: (req: NextRequest, session: Session) => Promise<T>
) {
  return async (req: NextRequest): Promise<T | NextResponse> => {
    const { error, session } = await requireAuth();
    
    if (error) {
      return error;
    }

    return handler(req, session as Session);
  };
}
