import { fetchCardPrintings } from "@/api/scryfall/cache";
import { cardKeys } from "@/store";
import { useQueries, useQuery } from "@tanstack/react-query";

export function useCardPrintings(cardName: string) {
  return useQuery({
    queryKey: cardKeys.prints(cardName),
    queryFn: () => fetchCardPrintings(cardName),
    enabled: Boolean(cardName),
    staleTime: Infinity,
  });
}

export function useMultipleCardPrintings(cardNames: string[]) {
  return useQueries({
    queries: cardNames.map((name) => ({
      queryKey: cardKeys.prints(name),
      queryFn: () => fetchCardPrintings(name),
      enabled: Boolean(name),
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 60 * 24,
    })),
  });
}
