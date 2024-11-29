import { useMemo, useState } from "react";
import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardOption, CardType, Currency, DeckPricingResult } from "@/types";
import { cn, getFormattedPrice } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/localStorage";
import { Finish } from "@/__generated__/graphql";

const cardTypes: Record<CardType, { label: string; emoji: string }> = {
  Battle: {
    label: "Battle",
    emoji: "⚔️",
  },
  Planeswalker: {
    label: "Planeswalker",
    emoji: "🧙",
  },
  Creature: {
    label: "Creature",
    emoji: "🦖",
  },
  Instant: {
    label: "Instant",
    emoji: "⚡",
  },
  Sorcery: {
    label: "Sorcery",
    emoji: "🌀",
  },
  Land: {
    label: "Land",
    emoji: "🗺️",
  },
  Enchantment: {
    label: "Enchantment",
    emoji: "✨",
  },
  Artifact: {
    label: "Artifact",
    emoji: "⚙️",
  },
};

type SortOrder = "none" | "asc" | "desc";

interface CardTypeSectionProps {
  cardType: CardType;
  cardNames: string[];
  deckResult: DeckPricingResult;
  isLocked: boolean;
  lockedCard: string;
  setSelectedCard: (selectedPrinting: CardOption, shouldLock: boolean) => void;
}

export const CardTypeSection = ({
  cardType,
  cardNames,
  deckResult,
  isLocked,
  lockedCard,
  setSelectedCard,
}: CardTypeSectionProps) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const sortedCardNames = useMemo(() => {
    if (sortOrder === "none") {
      return cardNames;
    }
    return cardNames.slice().sort((a, b) => {
      const aKey = a.includes("//") ? a.split("//")[0].trim() : a;
      const bKey = b.includes("//") ? b.split("//")[0].trim() : b;
      const aPrice = deckResult.bling[aKey]?.treatments.filter(
        (t) => t.name === deckResult.bling[aKey]?.selectedTreatment
      )[0]?.price;
      const bPrice = deckResult.bling[bKey]?.treatments.filter(
        (t) => t.name === deckResult.bling[bKey]?.selectedTreatment
      )[0]?.price;
      if (sortOrder === "asc") {
        return (aPrice ?? 0) - (bPrice ?? 0);
      }
      return (bPrice ?? 0) - (aPrice ?? 0);
    });
  }, [cardNames, deckResult, sortOrder]);

  const getSortButtonAltTest = () => {
    if (sortOrder === "none") {
      return `Click to sort cards under ${cardType} by price ascending`;
    }
    if (sortOrder === "asc") {
      return `Click to sort cards under ${cardType} by price descending`;
    }
    return `Click to return cards under ${cardType} to default order`;
  };

  return (
    <div className="break-inside-avoid-column mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">
          {cardTypes[cardType] ? cardTypes[cardType].emoji : ""}
        </span>
        <h2 className="text-lg font-semibold">
          {cardType} ({cardNames.length})
        </h2>
        {cardNames.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={getSortButtonAltTest()}
            onClick={() => {
              if (sortOrder === "none") {
                setSortOrder("asc");
                return;
              }
              if (sortOrder === "asc") {
                setSortOrder("desc");
                return;
              }
              setSortOrder("none");
            }}
          >
            {sortOrder === "none" && <ArrowUpDown />}
            {sortOrder === "asc" && <SortAsc />}
            {sortOrder === "desc" && <SortDesc />}
          </Button>
        )}
      </div>
      <div className="space-y-0.5">
        {sortedCardNames.map((cardName) => {
          const cardNameKey = cardName.includes("//")
            ? cardName.split("//")[0].trim()
            : cardName;
          const selectedPrinting = Object.entries(deckResult.bling).filter(
            ([key]) => key.startsWith(cardNameKey)
          )[0]?.[1];
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
            <CardItem
              key={cardName}
              cardName={cardName}
              quantity={quantity}
              isLocked={isLocked}
              lockedCard={lockedCard}
              selectedPrinting={selectedPrinting}
              setSelectedCard={setSelectedCard}
            />
          );
        })}
      </div>
    </div>
  );
};

interface CardItemProps {
  cardName: string;
  quantity: number;
  isLocked: boolean;
  lockedCard: string;
  selectedPrinting: CardOption;
  setSelectedCard: (selectedPrinting: CardOption, shouldLock: boolean) => void;
}

const CardItem = ({
  cardName,
  quantity,
  isLocked,
  lockedCard,
  selectedPrinting,
  setSelectedCard,
}: CardItemProps) => {
  const [localCurrency] = useLocalStorage("localCurrency", Currency.USD);
  return (
    <div
      key={cardName}
      className={cn(
        "flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-sm",
        {
          "bg-gray-100 dark:bg-gray-800": cardName === lockedCard,
        }
      )}
      onMouseEnter={() => {
        if (!isLocked) setSelectedCard(selectedPrinting, false);
      }}
      onClick={() => setSelectedCard(selectedPrinting, true)}
    >
      <span className="w-4 text-right text-gray-500 dark:text-gray-400">
        {quantity}
      </span>
      <span className="flex-1 truncate">{cardName}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {localCurrency === Currency.USD ? "$" : "€"}
        {getFormattedPrice(selectedPrinting)}{" "}
      </span>
      {selectedPrinting.selectedTreatment &&
        selectedPrinting.selectedTreatment !== Finish.Nonfoil && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {selectedPrinting.selectedTreatment}
          </span>
        )}
    </div>
  );
};
