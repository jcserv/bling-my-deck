import { useQuery } from "@tanstack/react-query";

import { queryCardNames, fetchCardPrintings } from "@/api/scryfall/cache";
import { cardKeys } from "@/store";

export function useCardPrintings(cardName: string) {
  return useQuery({
    queryKey: cardKeys.prints(cardName),
    queryFn: () => fetchCardPrintings(cardName),
    enabled: Boolean(cardName),
    staleTime: Infinity,
  });
}

export function useAutocomplete(query: string) {
  return useQuery({
    queryKey: cardKeys.autocomplete(query),
    queryFn: () => queryCardNames(query),
    enabled: query.length >= 2,
    staleTime: Infinity,
  });
}
