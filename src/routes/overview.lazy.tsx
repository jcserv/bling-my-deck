import { ScryfallClient } from "@/api/scryfall/client";
import DeckViewer from "@/components/DeckViewer";
import { useLocalStorage } from "@/hooks/localStorage";
import { BlingService } from "@/services/bling-service";
import { DeckPricingResult, Submission } from "@/types";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/overview")({
  component: Overview,
});

function Overview() {
  const [deckResult, setDeckResult] = useState<DeckPricingResult | null>(null);

  const [submission] = useLocalStorage("submission", null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!submission) return;
      const client = new ScryfallClient();
      const blingService = new BlingService(client);
      const sub = submission as Submission;

      const result = await blingService.processDecklist(sub);
      setDeckResult(result);
    };

    fetchData();
  }, [submission]);

  if (!submission) {
    navigate({
      to: "/",
    });
  }

  return (
    <section className="p-2">
      <div className="h-full">
        <DeckViewer deckResult={deckResult} />
      </div>
    </section>
  );
}
