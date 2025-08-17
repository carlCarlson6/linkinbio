import type { BeAppRouter } from "../../../backend/src/trpc";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";

// tRPC client setup
export const trpcReact = createTRPCReact<BeAppRouter>();
export const queryClient = new QueryClient();

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL;
if (!backendBaseUrl) {
  throw new Error('VITE_BACKEND_URL is not set in the environment. Please set it in your .env file.');
}

export const trpcClient = trpcReact.createClient({
  links: [
    httpBatchLink({
      url: `${backendBaseUrl}/api/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include', // Send cookies (Clerk session) with requests
        });
      },
    }),
  ],
});