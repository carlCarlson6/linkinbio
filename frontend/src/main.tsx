import "@radix-ui/themes/styles.css";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { queryClient, trpcReact, trpcClient } from './infrastructure/trpc';
import { Theme } from "@radix-ui/themes";
import { dashboardRoute } from "./Dashboard";
import { homeRoute } from "./Landing";
import { rootRoute } from "./infrastructure/tanstack-router";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set in the environment. Please set it in your .env file.');
}

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute,
    dashboardRoute
  ]),
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Theme>
            <RouterProvider router={router} />
          </Theme>
        </QueryClientProvider>
      </trpcReact.Provider>
    </ClerkProvider>
  </React.StrictMode>
);