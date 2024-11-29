import { Store } from "@tanstack/store";
import { queryClient } from "@/routes/__root";
import { Card } from "@/__generated__/graphql";

interface CardStore {
  // used for blingification
  cards: {
    [name: string]: Card[];
  };
  // used for typeahead
  cardNameQueries: {
    [name: string]: string[];
  };
}

const initialState: CardStore = {
  cards: {},
  cardNameQueries: {},
};

export const cardStore = new Store(initialState);

export const cardKeys = {
  all: ["cards"] as const,
  autocomplete: (query: string) => ["autocomplete", query] as const,
  prints: (cardName: string) => ["cards", "prints", cardName] as const,
  printsBatch: (cardNames: string[]) => ["cards", "prints", cardNames] as const,
};

export const cardActions = {
  setCardPrintings(cardName: string, printings: Card[]) {
    cardStore.setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardName]: printings,
      },
    }));
  },

  setBatchCardPrintings(cardMap: { [name: string]: Card[] }) {
    cardStore.setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        ...cardMap,
      },
    }));
  },

  setCardNameQuery(query: string, cardNames: string[]) {
    cardStore.setState((prev) => ({
      ...prev,
      cardNameQueries: {
        ...prev.cardNameQueries,
        [query]: cardNames,
      },
    }));
  },

  clearStore() {
    cardStore.setState(() => initialState);
    queryClient.removeQueries({ queryKey: cardKeys.all });
  },
};
