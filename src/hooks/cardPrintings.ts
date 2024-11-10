import { useQuery } from "@tanstack/react-query";

import { fetchCardPrintings } from "@/api/scryfall/cache";
import { cardKeys } from "@/store";

export function useCardPrintings(cardName: string) {
  return useQuery({
    queryKey: cardKeys.prints(cardName),
    queryFn: () => fetchCardPrintings(cardName),
    enabled: Boolean(cardName),
    staleTime: Infinity,
  });
}
