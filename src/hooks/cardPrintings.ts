import { useQuery } from "@tanstack/react-query";

import { fetchCardPrintings } from "@/api/scryfall/cache";
import { cardKeys } from "@/store";
import { Exclusion } from "@/types";

export function useCardPrintings(cardName: string, exclusions: Exclusion[]) {
  return useQuery({
    queryKey: cardKeys.prints(cardName),
    queryFn: () => fetchCardPrintings(cardName, exclusions),
    enabled: Boolean(cardName),
    staleTime: Infinity,
  });
}
