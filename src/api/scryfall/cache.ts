import { scryfallClient } from "@/routes/__root";
import { cardStore, cardActions } from "@/store";
import { ScryfallCard } from "./client";

export const fetchCardPrintings = async (cardName: string): Promise<ScryfallCard[]> => {
    const cached = cardStore.state.cards[cardName];
    if (cached) {
      return cached;
    }
  
    const printings = await scryfallClient.getAllPrintings(cardName);
    cardActions.setCardPrintings(cardName, printings);
    return printings;
};