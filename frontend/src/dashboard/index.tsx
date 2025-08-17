
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { createRoute, useRouter } from '@tanstack/react-router';
import { rootRoute } from '../infrastructure/tanstack-router';
import LoadingSpinner from '../components/Loading';
import { Button, Flex, Heading, Text } from '@radix-ui/themes';
import { trpcReact } from '../infrastructure/trpc';

export const dashboardRoute = createRoute({
  path: '/dashboard',
  component: Dashboard,
  getParentRoute: () => rootRoute,
});

function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const { data, isLoading, error } = trpcReact.dashboardInfo.useQuery(undefined, { enabled: isLoaded && isSignedIn });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.navigate({ to: '/' });
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isLoading) return (
    <Flex align="center" justify="center" style={{ minHeight: 200 }}>
      <LoadingSpinner size={40} />
    </Flex>
  );

  if (error) return <Text color="red">Failed to load dashboard info.</Text>;

  const bios = data?.bios ?? [];

  return (
    <Flex direction="row" gap="8" style={{ width: '100%', height: '100%', alignItems: 'flex-start', padding: '32px 0' }}>
      {/* Left: Bios List */}
      <Flex direction="column" gap="5" style={{ flex: 1, minWidth: 320 }}>
        <Heading size="7">Your Bios</Heading>
        <Button size="3" style={{ alignSelf: 'flex-end' }}>
          + New Bio asd
        </Button>
        {bios.length === 0 ? (
          <Text>No bios yet. Create your first one!</Text>
        ) : (
          <Flex direction="column" gap="4">
            {bios.map((bio: any) => (
              <Flex key={bio.id} direction="row" align="center" justify="between" style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                <Flex direction="column">
                  <Heading size="5">{bio.title}</Heading>
                  <Text color="gray">{bio.description}</Text>
                </Flex>
                <Flex gap="2">
                  <Button size="2" variant="soft">Edit</Button>
                  <Button size="2" color="red" variant="soft">Delete</Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>

      {/* Right: Bio Preview */}
      <Flex direction="column" style={{ flex: 2, minWidth: 0, background: '#fafbfc', borderRadius: 12, border: '1px solid #eee', padding: 32, alignItems: 'center', justifyContent: 'center' }}>
        <Heading size="6" color="gray">Bio Preview</Heading>
        <Text color="gray">Select a bio to see a preview here.</Text>
      </Flex>
    </Flex>
  );
}
