import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";

import { ManaqlClient } from "@/api/manaql/client";
import { Toaster } from "@/components/ui";
import { ErrorBanner, Footer, Header } from "@/components";
import { ScryfallClient } from "@/api/scryfall/client";

const apolloClient = new ApolloClient({
  uri: "https://api.manaql.com",
  cache: new InMemoryCache(),
});

export const manaqlClient = new ManaqlClient(apolloClient);
export const scryfallClient = new ScryfallClient();
export const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <Header />
        <hr />
        <Outlet />
        <Footer />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </QueryClientProvider>
    </ApolloProvider>
  ),
  errorComponent: ({ error }) => (
    <>
      <Header />
      <hr />
      <div className="flex w-full h-[80vh] justify-center align-middle">
        <ErrorBanner
          message="An unexpected error occurred. Please open a Github issue with the below error details."
          error={error.message}
          className="h-1/3"
        />
      </div>
      <Footer />
    </>
  ),
});
