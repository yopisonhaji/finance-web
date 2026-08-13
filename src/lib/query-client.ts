import { QueryClient } from '@tanstack/react-query';

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
        },
      },
    });
  } else {
    // Browser: make a new query client if we don't already have one
    if (!window._queryClient) {
      window._queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false, // Prevents excessive refetches
          },
        },
      });
    }
    return window._queryClient;
  }
}

// Global declaration for TypeScript
declare global {
  interface Window {
    _queryClient: QueryClient | undefined;
  }
}
