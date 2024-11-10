import { useEffect, useMemo, useState } from "react";
import { CopyIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardDisplay } from "@/components/CardDisplay";
import { CardTypeSection } from "@/components/CardTypeSection";
import { useToast } from "@/hooks/use-toast";
import { toMoxfield } from "@/lib/decklist";
import { DeckPricingResult, CardOption, CardType } from "@/types";

const DeckViewer = ({
  deckResult,
}: {
  deckResult: DeckPricingResult | null;
}) => {
  const [deck, setDeck] = useState<CardOption[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null);
  const { toast } = useToast();

  const CardTypeGroups: Record<CardType, string[]> = {
    Battle: [],
    Planeswalker: [],
    Creature: [],
    Sorcery: [],
    Instant: [],
    Artifact: [],
    Enchantment: [],
    Land: [],
  };

  useEffect(() => {
    if (deckResult) {
      const deck = Object.values(deckResult.bling);
      setDeck(deck);
    }
  }, [deckResult]);

  const groupedCards = useMemo(() => {
    if (!deck) return CardTypeGroups;
    return Object.entries(deck).reduce((acc, [, cardDetails]) => {
      const cardName = cardDetails.cardName;
      const cardType = cardDetails.cardType as CardType;
      if (acc[cardType] && !acc[cardType].includes(cardName)) {
        acc[cardType].push(cardName);
      } else {
        acc[cardType] = [cardName];
      }
      return acc;
    }, CardTypeGroups);
  }, [deck]);

  const copyDeckList = () => {
    if (!deckResult) return;
    navigator.clipboard.writeText(toMoxfield(deck));
    toast({
      title: "Decklist copied to clipboard",
      description: "You can now paste it into Moxfield",
    });
  };

  if (!deckResult) return null;
  return (
    <div className="flex gap-4 p-4">
      <div className="w-[280px]">
        <div className="sticky top-4 space-y-4">
          <CardDisplay selectedCard={selectedCard} />
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Price:
              </span>
              <span className="font-semibold">
                $
                {selectedCard?.treatments
                  .filter((t) => t.name === selectedCard?.selectedTreatment)[0]
                  ?.price?.toFixed(2)}{" "}
                USD
              </span>
            </div>
          </Card>
          <Card className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Price:
              </span>
              <span className="font-semibold">
                ${deckResult.totalPrice.toFixed(2)} USD
              </span>
            </div>
            {deckResult.missingPrices && (
              <div className="text-sm text-yellow-600">
                Some prices are unavailable
              </div>
            )}
            <Button className="w-full" onClick={copyDeckList} variant="outline">
              <CopyIcon className="w-4 h-4 mr-2" />
              Copy Decklist (Moxfield)
            </Button>
          </Card>
          {deckResult.stats.numMissingCards > 0 && (
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Missing cards:
                </span>
                <span className="font-semibold">
                  {deckResult.stats.numMissingCards}
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
      <div className="flex-1 columns-[250px] gap-4">
        {Object.entries(groupedCards).map(
          ([type, cardNames]) =>
            cardNames.length > 0 && (
              <CardTypeSection
                key={type}
                cardType={type as CardType}
                cardNames={cardNames}
                deckResult={deckResult}
                setSelectedCard={setSelectedCard}
              />
            ),
        )}
      </div>
    </div>
  );
};

export default DeckViewer;
