import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { DeckPricingResult, CardOption, Treatment } from "@/types";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toMoxfield } from "@/lib/decklist";

type CardType =
  | "Creatures"
  | "Planeswalker"
  | "Instant"
  | "Sorcery"
  | "Artifact"
  | "Enchantment"
  | "Land"
  | "Battle";

const CardTypeGroups: Record<CardType, string[]> = {
  Creatures: [],
  Planeswalker: [],
  Instant: [],
  Sorcery: [],
  Artifact: [],
  Enchantment: [],
  Land: [],
  Battle: [],
};

const DeckViewer = ({
  deckResult,
}: {
  deckResult: DeckPricingResult | null;
}) => {
  const [deck, setDeck] = useState<CardOption[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null);

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
  };

  if (!deckResult) return null;

  return (
    <div className="flex gap-4 p-4">
      <div className="w-[280px]">
        <div className="sticky top-4 space-y-4">
          <Card className="aspect-[745/1040] bg-gray-100">
            {selectedCard ? (
              <img
                src={selectedCard.image}
                alt={selectedCard.cardName}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center text-center justify-center h-full text-gray-500">
                Hover over a card to see its image
              </div>
            )}
          </Card>
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Price:</span>
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
              <span className="text-sm text-gray-600">Total Price</span>
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
        </div>
      </div>
      <div
        className="flex-1 grid gap-4 auto-rows-min"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        }}
      >
        {Object.entries(groupedCards).map(
          ([type, cardNames]) =>
            cardNames.length > 0 && (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  {type === "Battle" && <span className="text-lg">⚔️</span>}
                  {type === "Planeswalker" && (
                    <span className="text-lg">🧙</span>
                  )}
                  {type === "Creature" && <span className="text-lg">🦖</span>}
                  {type === "Instant" && <span className="text-lg">⚡</span>}
                  {type === "Sorcery" && <span className="text-lg">🌀</span>}
                  {type === "Land" && <span className="text-lg">🗺️</span>}
                  {type === "Enchantment" && (
                    <span className="text-lg">✨</span>
                  )}
                  {type === "Artifact" && <span className="text-lg">⚙️</span>}
                  <h2 className="text-lg font-semibold">
                    {type} ({cardNames.length})
                  </h2>
                </div>
                <div className="space-y-0.5">
                  {cardNames.map((cardName) => {
                    const cardNameKey = cardName.includes("//")
                      ? cardName.split("//")[0].trim()
                      : cardName;
                    const selectedPrinting = Object.entries(
                      deckResult.bling
                    ).filter(([key]) => key.startsWith(cardNameKey))[0]?.[1];
                    if (!selectedPrinting) {
                      console.log(
                        "No printings found for ",
                        cardName,
                        "please open an issue."
                      );
                      return null;
                    }
                    const quantity = selectedPrinting.quantity;
                    return (
                      <div
                        key={cardName}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer text-sm"
                        onMouseEnter={() => setSelectedCard(selectedPrinting)}
                      >
                        <span className="w-4 text-right text-gray-600">
                          {quantity}
                        </span>
                        <span className="flex-1 truncate">{cardName}</span>
                        <span className="text-xs text-gray-500">
                          $
                          {selectedPrinting?.treatments
                            .filter(
                              (t) =>
                                t.name === selectedPrinting?.selectedTreatment
                            )[0]
                            ?.price?.toFixed(2)}{" "}
                          USD
                        </span>
                        {selectedPrinting.selectedTreatment &&
                          selectedPrinting.selectedTreatment !==
                            Treatment.Normal && (
                            <span className="text-xs text-gray-500">
                              {selectedPrinting.selectedTreatment}
                            </span>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default DeckViewer;
