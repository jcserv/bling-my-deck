import { createFileRoute } from "@tanstack/react-router";

import { CartForm, ErrorBanner, InfoBanner } from "@/components";

type Params = {
  error: string;
};

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>): Params | null => ({
    error: search?.error as string,
  }),
});

function Index() {
  const params = Route.useSearch();
  const error = params?.error as string;
  return (
    <section className="p-2 md:p-4">
      <div className="min-h-[80vh] w-full flex flex-col items-center">
        {!error ? (
          <InfoBanner>
            <>
              <span>
                Enter the cards you want to bling out, and we&apos;ll show you
                all of the most expensive printings available for each card, as
                well as the total cost.
              </span>
              <br />
              <span className="italic">
                Note: Prices may not be up-to-date, please see{" "}
                <a
                  href="https://scryfall.com/docs/faqs/where-do-scryfall-prices-come-from-7"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  here
                </a>{" "}
                for more information.
              </span>
            </>
          </InfoBanner>
        ) : (
          <ErrorBanner
            message="Unable to retrieve printings for a card, please try again and ensure the name matches exactly."
            error={error}
          />
        )}
        <CartForm />
      </div>
    </section>
  );
}

export default Index;
