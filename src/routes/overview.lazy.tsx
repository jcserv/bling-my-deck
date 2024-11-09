import DeckViewer from "@/components/DeckViewer";
import { Loading } from "@/components/Loading";
import { useLocalStorage } from "@/hooks/localStorage";
import { BlingService } from "@/services/bling-service";
import { DeckPricingResult, Submission } from "@/types";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
      const blingService = new BlingService();
      const sub = submission as Submission;

      const result = await blingService.processDecklist(sub);
      setDeckResult(result);
    };

    fetchData().then(() => setTimeout(() => setLoading(false), 2500));
  }, [submission]);

  if (!submission) {
    navigate({
      to: "/",
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
              }...
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
