import { useEffect, useMemo, useState } from "react";
import { CopyIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardDisplay } from "@/components/CardDisplay";
import { CardTypeSection } from "@/components/CardTypeSection";
import { useToast } from "@/hooks/use-toast";
import { toMoxfield } from "@/lib/decklist";
import { DeckPricingResult, CardOption, CardType, Treatment } from "@/types";
import TreatmentSelect from "./TreatmentSelect";

const DeckViewer = ({
  deckResult,
}: {
  deckResult: DeckPricingResult | null;
}) => {
  const [deck, setDeck] = useState<CardOption[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null);
  const [lockedCard, setLockedCard] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
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

  const handlePrintingChange = (cardName: string, newPrinting: CardOption) => {
    const newPrintingWithTreatment = {
      ...newPrinting,
      selectedTreatment: (newPrinting.treatments.some(
        (t) => t.name === selectedCard?.selectedTreatment
      )
        ? selectedCard?.selectedTreatment
        : newPrinting.treatments[0]?.name) as Treatment,
    };

    setDeck((prev) =>
      prev.map((card) => {
        if (card.cardName === cardName) {
          return newPrintingWithTreatment;
        }
        return card;
      })
    );

    if (selectedCard?.cardName === cardName) {
      setSelectedCard(newPrintingWithTreatment);
    }

    if (deckResult) {
      deckResult.bling[cardName] = newPrintingWithTreatment;

      const newTotalPrice = Object.values(deckResult.bling).reduce(
        (total, card) => {
          const selectedTreatmentPrice =
            card.treatments.find((t) => t.name === card.selectedTreatment)
              ?.price || 0;
          return total + selectedTreatmentPrice;
        },
        0
      );

      deckResult.totalPrice = newTotalPrice;
    }
  };

  const handleTreatmentChange = (cardName: string, treatment: string) => {
    setDeck((prev) =>
      prev.map((card) => {
        if (card.cardName === cardName) {
          return {
            ...card,
            selectedTreatment: treatment as Treatment,
          };
        }
        return card;
      })
    );

    if (selectedCard?.cardName === cardName) {
      setSelectedCard((prev) =>
        prev
          ? {
              ...prev,
              selectedTreatment: treatment as Treatment,
            }
          : null
      );
    }

    if (deckResult) {
      const updatedCard = {
        ...deckResult.bling[cardName],
        selectedTreatment: treatment as Treatment,
      };

      deckResult.bling[cardName] = updatedCard;
      const newTotalPrice = Object.values(deckResult.bling).reduce(
        (total, card) => {
          const selectedTreatmentPrice =
            card.treatments.find((t) => t.name === card.selectedTreatment)
              ?.price || 0;
          return total + selectedTreatmentPrice;
        },
        0
      );
      deckResult.totalPrice = newTotalPrice;
    }
  };

  const validateAndGetCard = (card: CardOption): CardOption => {
    if (
      !card.selectedTreatment ||
      !card.treatments.find(
        (t) => t.name === card.selectedTreatment && t.available
      )
    ) {
      const firstAvailableTreatment = card.treatments.find((t) => t.available);
      return {
        ...card,
        selectedTreatment: firstAvailableTreatment?.name as Treatment,
      };
    }
    return card;
  };

  const handleCardSelect = (card: CardOption | null, shouldLock: boolean) => {
    if (!card) {
      setSelectedCard(null);
      return;
    }

    const validatedCard = validateAndGetCard(card);
    setSelectedCard(validatedCard);

    if (validatedCard.selectedTreatment !== card.selectedTreatment) {
      handleTreatmentChange(card.cardName, validatedCard.selectedTreatment!);
    }

    if (!shouldLock) return;
    if (lockedCard === validatedCard.cardName) {
      setIsLocked(false);
      setLockedCard("");
    } else {
      setLockedCard(validatedCard.cardName);
      setIsLocked(true);
    }
  };

  if (!deckResult) return null;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      <div className="w-full md:w-[280px] p-4">
        <div className="sticky top-4 flex max-md:flex-row md:flex-col gap-4">
          <div className="max-md:w-1/2 w-full">
            <CardDisplay
              selectedCard={selectedCard}
              allPrintings={
                selectedCard
                  ? (deckResult.cards[selectedCard.cardName] ??
                    deckResult.cards[selectedCard.cardName.split(" // ")[0]])
                  : undefined
              }
              onPrintingChange={handlePrintingChange}
            />
          </div>
          <div className="max-md:w-1/2 w-full space-y-4 flex flex-col justify-center">
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Price:
                </span>
                <span className="font-semibold">
                  $
                  {(selectedCard &&
                    selectedCard.treatments
                      ?.find((t) => t.name === selectedCard.selectedTreatment)
                      ?.price?.toFixed(2)) ??
                    "0.00"}{" "}
                  USD
                </span>
              </div>
            </Card>
            {selectedCard && selectedCard.treatments.some((t) => t.price) && (
              <Card className="p-4">
                <TreatmentSelect
                  card={selectedCard}
                  onPrintingChange={handleTreatmentChange}
                />
              </Card>
            )}
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
              <Button
                className="w-full text-xs sm:text-sm whitespace-normal h-auto py-2"
                onClick={copyDeckList}
                variant="outline"
              >
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
                  isLocked={isLocked}
                  lockedCard={lockedCard}
                  setSelectedCard={handleCardSelect}
                />
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckViewer;
