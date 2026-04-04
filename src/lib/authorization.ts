import { redirect } from "@tanstack/react-router";

export type AuthUser = {
  userId: string;
  orgRole: string | null;
  orgPermissions: string[];
};

export function requireAuth(
  user: AuthUser | undefined
): asserts user is AuthUser {
  if (!user) {
    throw redirect({ to: "/" });
  }
}
