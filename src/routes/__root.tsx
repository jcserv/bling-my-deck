import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";

import { ScryfallClient } from "@/api/scryfall/client";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

export const queryClient = new QueryClient()
export const scryfallClient = new ScryfallClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Header />
      <hr />
      <Outlet />
      <Footer />
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </QueryClientProvider>
  ),
});
