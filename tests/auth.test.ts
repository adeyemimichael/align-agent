import { describe, it, expect } from "vitest";

describe("Authentication Setup", () => {
  it("should have NextAuth configuration", async () => {
    // Simple test to verify auth module can be imported
    const authModule = await import("@/lib/auth");
    expect(authModule).toBeDefined();
    expect(authModule.auth).toBeDefined();
    expect(authModule.signIn).toBeDefined();
    expect(authModule.signOut).toBeDefined();
  });

  it("should have auth utilities", async () => {
    const authUtils = await import("@/lib/auth-utils");
    expect(authUtils.requireAuth).toBeDefined();
    expect(authUtils.withAuth).toBeDefined();
  });
});
