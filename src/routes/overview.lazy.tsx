import { useEffect, useState } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import { DeckViewer, Loading } from "@/components";
import { useLocalStorage } from "@/hooks/localStorage";
import { DeckPricingResult, Submission } from "@/types";
import { createPricingService } from "@/services/pricing/factory";

const loadingMessages = [
  "Bolting the bird",
  "Cracking a fetch",
  "Paying the one",
  "Responding with a counterspell",
  "Shuffling up",
  "Cracking a pack",
  "Untapping",
];

export const Route = createLazyFileRoute("/overview")({
  component: Overview,
});

function Overview() {
  const [deckResult, setDeckResult] = useState<DeckPricingResult | null>(null);
  const [loading, setLoading] = useState(true);

  const [submission] = useLocalStorage("submission", null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!submission) return;
      const sub = submission as Submission;
      const pricingService = createPricingService(sub.localCurrency, sub.exclusions);
      const start = Date.now();
      const result = await pricingService.processDecklist(sub);
      console.log(`Pricing Service took ${Date.now() - start}ms`);
      setDeckResult(result);
    };

    fetchData()
      .then(() => setTimeout(() => setLoading(false), 100))
      .catch((err: Error) => {
        navigate({
          to: "/",
          search: {
            error: err.stack ?? err.message,
          },
        });
      });
  }, [submission]);

  if (!submission) {
    navigate({
      to: "/",
      search: { error: "" },
    });
  }

  return (
    <section className="p-2">
      <div className="h-full">
        {loading ? (
          <div className="text-center h-[80vh]">
            <h1 className="mb-12">
              {
                loadingMessages[
                  Math.floor(Math.random() * loadingMessages.length)
                ]
              }
              ...
            </h1>
            <Loading />
          </div>
        ) : (
          <DeckViewer deckResult={deckResult} />
        )}
      </div>
    </section>
  );
}
