import { cardStore, cardActions } from "@/store";
import { scryfallClient } from "@/routes/__root";
import { scryfallToCard } from "@/types/scryfall";
import { Exclusion } from "@/types";
import { Card } from "@/__generated__/graphql";

export const fetchCardPrintings = async (
  cardName: string,
  exclusions: Exclusion[],
): Promise<Card[]> => {
  const cached = cardStore.state.cards[cardName];
  if (cached) {
    return cached;
  }

  const scryfallCards = await scryfallClient.getAllPrintings(cardName, exclusions);
  const cards = scryfallCards.map(scryfallToCard);
  
  cardActions.setCardPrintings(cardName, cards);  
  return cards;
};

export const queryCardNames = async (query: string): Promise<string[]> => {
  const cached = cardStore.state.cardNameQueries[query];
  if (cached) {
    return cached;
  }

  const cards = await scryfallClient.getCardNamesByAutocomplete(query);
  cardActions.setCardNameQuery(query, cards);
  return cards;
};