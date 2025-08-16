import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/src/trpc";
import { QueryClient } from "@tanstack/react-query";

// tRPC client setup
export const trpc = createTRPCReact<AppRouter>();
export const queryClient = new QueryClient();

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL;
if (!backendBaseUrl) {
  throw new Error('VITE_BACKEND_URL is not set in the environment. Please set it in your .env file.');
}
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${backendBaseUrl}/api/trpc`,
    }),
  ],
});