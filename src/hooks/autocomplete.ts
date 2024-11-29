import { useQuery } from "@tanstack/react-query";

import { cardKeys } from "@/store";
import { queryCardNames } from "@/api/manaql/cache";

export function useAutocomplete(query: string) {
  return useQuery({
    queryKey: cardKeys.autocomplete(query),
    queryFn: () => queryCardNames(query),
    enabled: query.length >= 2,
    staleTime: Infinity,
  });
}
