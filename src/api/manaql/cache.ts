import { cardStore, cardActions } from "@/store";
import { manaqlClient } from "@/routes/__root";
import { Card, Finish } from "@/__generated__/graphql";

const BATCH_SIZE = 100;

export const fetchCardPrintings = async (
  cardNames: string[],
  treatments: Finish[]
): Promise<{ [name: string]: Card[] }> => {
  const uncachedCards = cardNames.filter(
    (name) => !cardStore.state.cards[name]
  );
  if (uncachedCards.length === 0) {
    const result = cardNames.reduce(
      (acc, name) => {
        if (name) {
          acc[name] = cardStore.state.cards[name] || [];
        }
        return acc;
      },
      {} as { [name: string]: Card[] }
    );
    return result;
  }

  const cardsByName: { [name: string]: Card[] } = {};
  
  // Fetch uncached cards in batches of BATCH_SIZE
  for (let i = 0; i < uncachedCards.length; i += BATCH_SIZE) {
    const batch = uncachedCards.slice(i, i + BATCH_SIZE);
    
    const response = await manaqlClient.getAllPrintings(batch, treatments);
    if (Array.isArray(response)) {
      response.forEach(card => {
        if (card?.name) {
          // Initialize array if it doesn't exist
          if (!cardsByName[card.name]) {
            cardsByName[card.name] = [];
          }
          cardsByName[card.name].push(card);
        }
      });
    }
  }

  Object.entries(cardsByName).forEach(([name, cards]) => {
    cardActions.setCardPrintings(name, cards);
  });

  // Return all requested cards (both cached and newly fetched)
  const result = cardNames.reduce(
    (acc, name) => {
      if (name) {
        acc[name] = cardStore.state.cards[name] || cardsByName[name] || [];
      }
      return acc;
    },
    {} as { [name: string]: Card[] }
  );

  return result;
};

export const queryCardNames = async (query: string): Promise<string[]> => {
  const cached = cardStore.state.cardNameQueries[query];
  if (cached) {
    return cached;
  }

  const cards = await manaqlClient.getCardNamesByAutocomplete(query);
  cardActions.setCardNameQuery(query, cards);
  return cards;
};