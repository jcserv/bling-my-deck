import { ScryfallCard } from "@/api/scryfall/client";
import { queryClient } from "@/routes/__root";
import { Store } from "@tanstack/store";

interface CardStore {
  cards: {
    [name: string]: ScryfallCard[];
  };
}

const initialState: CardStore = {
  cards: {},
};

export const cardStore = new Store(initialState);

export const cardKeys = {
  all: ["cards"] as const,
  prints: (cardName: string) => ["cards", "prints", cardName] as const,
};

export const cardActions = {
  setCardPrintings(cardName: string, printings: ScryfallCard[]) {
    cardStore.setState((prev) => ({
      cards: {
        ...prev.cards,
        [cardName]: printings,
      },
    }));
  },

  clearStore() {
    cardStore.setState(() => initialState);
    queryClient.removeQueries({ queryKey: cardKeys.all });
  },
};
