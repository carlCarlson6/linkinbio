import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { createRoute, useRouter } from '@tanstack/react-router';
import { rootRoute } from '../infrastructure/tanstack-router';
import Loading from '../infrastructure/components/Loading';

export const dashboardRoute = createRoute({
  path: '/dashboard',
  component: Dashboard,
  getParentRoute: () => rootRoute,
});

function Dashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.navigate({ to: '/' });
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return (
    <Loading />
  );

  return (
    <div>
      <h3>Dashboard</h3>
      <p>Welcome to your dashboard!</p>
    </div>
  );
}
