import { useUser, SignInButton } from '@clerk/clerk-react';
import { createRoute, useRouter } from '@tanstack/react-router';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { rootRoute } from '../infrastructure/tanstack-router';

export const homeRoute = createRoute({
  path: '/',
  component: Home,
  getParentRoute: () => rootRoute,
});

function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <>
      <Flex direction="column" align="center" justify="center" style={{ minHeight: '60vh', gap: 24 }}>
        <Heading size="8">Welcome to LinkInBio</Heading>
        {isSignedIn ? (
          <Button size="4" onClick={() => router.navigate({ to: '/dashboard' })}>
            Enter
          </Button>
        ) : (
          <SignInButton mode="modal" forceRedirectUrl={"/dashboard"}>
            <Button size="4">Enter</Button>
          </SignInButton>
        )}
      </Flex>
    </>
  );
}