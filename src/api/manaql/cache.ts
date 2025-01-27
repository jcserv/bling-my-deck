import { cardStore, cardActions } from "@/store";
import { manaqlClient } from "@/routes/__root";
import { Card, Finish } from "@/__generated__/graphql";
import { Exclusion } from "@/types";

const BATCH_SIZE = 100;

export const fetchCardPrintings = async (
  cardNames: string[],
  treatments: Finish[],
  exclusions: Exclusion[]
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
  
  for (let i = 0; i < uncachedCards.length; i += BATCH_SIZE) {
    const batch = uncachedCards.slice(i, i + BATCH_SIZE);
    
    const response = await manaqlClient.getAllPrintings(batch, treatments, exclusions);
    if (Array.isArray(response)) {
      response.forEach(card => {
        if (card?.name) {
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