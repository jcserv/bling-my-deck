export const ONE_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

export type Card = {
  name: string;
  quantity: number;
  set?: string | undefined;
  collectorNumber?: string | undefined;
};

export type CardType =
  | "Creature"
  | "Planeswalker"
  | "Instant"
  | "Sorcery"
  | "Artifact"
  | "Enchantment"
  | "Land"
  | "Battle";

export const CardTypeOrdering: Record<CardType, number> = {
  Battle: 0,
  Planeswalker: 1,
  Creature: 2,
  Instant: 3,
  Sorcery: 4,
  Artifact: 5,
  Enchantment: 6,
  Land: 7,
};

const cardlineRegex =
  /^(\d+)\s+(.+?)(?:\s+\(([A-Z0-9]+)\)\s+(\d+))?(?:\s+\[([A-Z0-9]+)\])?$/;

export function parseDeckList(input: string): Card[] {
  const lines = input.split("\n");
  const cardMap: { [name: string]: Card } = {};

  for (const line of lines) {
    const match = line.trim().match(cardlineRegex);
    if (match) {
      const [, quantity, name, set, collectorNumber, alternateSet] = match;
      const cardKey = `${name}-${set || alternateSet || ""}-${collectorNumber || ""}`;
      if (cardMap[cardKey]) {
        cardMap[cardKey].quantity += parseInt(quantity, 10);
      } else {
        cardMap[cardKey] = {
          name,
          quantity: parseInt(quantity, 10),
          set: set || alternateSet || undefined,
          collectorNumber: collectorNumber || undefined,
        };
      }
    }
  }

  return Object.values(cardMap);
}

export enum Treatment {
  Normal = "Normal",
  Foil = "Foil",
  Etched = "Etched",
}

export const AllTreatments: string[] = Object.values(Treatment);

export type Submission = {
  decklist: Card[];
  treatments: Treatment[];
  localCurrency: string;
};

export interface CardOption {
  id: string;
  cardName: string;
  cardType: string;
  setName: string;
  setCode: string;
  collectorNumber: string;
  image?: string;
  treatments: Array<{
    name: Treatment;
    price: number | null;
    available: boolean;
  }>;
  quantity: number;
  selected: boolean;
  selectedTreatment?: Treatment;
}

export interface DeckPricingResult {
  bling: {
    [name: string]: CardOption;
  };
  cards: {
    [name: string]: CardOption[];
  };
  totalPrice: number;
  missingPrices: boolean;
  stats: {
    totalCards: number;
    uniqueCards: number;
    selectedCards: number;
    numMissingCards: number;
  };
}
