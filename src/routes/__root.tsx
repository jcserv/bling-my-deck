import { ScryfallClient } from "@/api/scryfall/client";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const queryClient = new QueryClient()
export const scryfallClient = new ScryfallClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Header />
      <hr />
      <Outlet />
      <Footer />
    </QueryClientProvider>
  ),
});
