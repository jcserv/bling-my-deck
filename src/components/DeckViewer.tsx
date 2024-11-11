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
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      <div className="w-full md:w-[280px] p-4">
        <div className="sticky top-4 flex max-md:flex-row md:flex-col gap-4">
          <div className="max-md:w-1/2 w-full">
            <CardDisplay selectedCard={selectedCard} />
          </div>
          <div className="max-md:w-1/2 w-full space-y-4 flex flex-col justify-center">
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
              <Button className="w-full text-xs sm:text-sm whitespace-normal h-auto py-2" onClick={copyDeckList} variant="outline">
                <CopyIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
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
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="columns-1 md:columns-[250px] gap-4">
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
    </div>
  );
};

export default DeckViewer;