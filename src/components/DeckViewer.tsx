import { useEffect, useMemo, useState } from "react";
import { CopyIcon, LucideHelpCircle } from "lucide-react";

import {
  Card,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { CardDisplay, CardTypeSection, TreatmentSelect } from "@/components";
import { useToast } from "@/hooks/use-toast";
import { toMoxfield } from "@/lib/decklist";
import { DeckPricingResult, CardOption, CardType, Currency } from "@/types";
import { useLocalStorage } from "@/hooks/localStorage";
import { Finish } from "@/__generated__/graphql";

export const DeckViewer = ({
  deckResult,
}: {
  deckResult: DeckPricingResult | null;
}) => {
  const [deck, setDeck] = useState<CardOption[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null);
  const [lockedCard, setLockedCard] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [localCurrency] = useLocalStorage("localCurrency", Currency.USD);
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
        : newPrinting.treatments[0]?.name) as Finish,
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
            selectedTreatment: treatment as Finish,
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
              selectedTreatment: treatment as Finish,
            }
          : null
      );
    }

    if (deckResult) {
      const updatedCard = {
        ...deckResult.bling[cardName],
        selectedTreatment: treatment as Finish,
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
        selectedTreatment: firstAvailableTreatment?.name as Finish,
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
                  {localCurrency === Currency.USD ? "$" : "€"}
                  {(selectedCard &&
                    selectedCard.treatments
                      ?.find((t) => t.name === selectedCard.selectedTreatment)
                      ?.price?.toFixed(2)) ??
                    "0.00"}{" "}
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
                  {localCurrency === Currency.USD ? "$" : "€"}
                  {deckResult.totalPrice.toFixed(2)}
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
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">
                      {deckResult.stats.numMissingCards}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <LucideHelpCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="text-center">
                          {deckResult.stats.missingCards.map((name) => (
                            <p key={name}>{name}</p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
