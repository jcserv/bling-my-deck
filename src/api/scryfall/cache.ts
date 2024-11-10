import { cardStore, cardActions } from "@/store";
import { scryfallClient } from "@/routes/__root";
import { ScryfallCard } from "@/types/scryfall";

export const fetchCardPrintings = async (
  cardName: string
): Promise<ScryfallCard[]> => {
  const cached = cardStore.state.cards[cardName];
  if (cached) {
    return cached;
  }

  const printings = await scryfallClient.getAllPrintings(cardName);
  cardActions.setCardPrintings(cardName, printings);
  return printings;
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
