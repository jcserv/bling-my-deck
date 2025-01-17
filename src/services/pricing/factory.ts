import { CardPricingService } from "./types";
import { ManaqlPricingService } from "./manaql";
import { ScryfallPricingService } from "./scryfall";
import { Currency, Exclusion } from "@/types";

export function createPricingService(
  localCurrency: Currency,
  exclusions: Exclusion[]
): CardPricingService {
  const useScryfall = import.meta.env.VITE_USE_SCRYFALL === "true";
  return useScryfall
    ? new ScryfallPricingService(localCurrency, exclusions)
    : new ManaqlPricingService(localCurrency, exclusions);
}