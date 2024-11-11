import { useQuery } from "@tanstack/react-query";

import { queryCardNames } from "@/api/scryfall/cache";
import { cardKeys } from "@/store";

export function useAutocomplete(query: string) {
  return useQuery({
    queryKey: cardKeys.autocomplete(query),
    queryFn: () => queryCardNames(query),
    enabled: query.length >= 2,
    staleTime: Infinity,
  });
}
