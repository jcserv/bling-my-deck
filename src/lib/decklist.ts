import { CardOption, Treatment } from "@/types";

export function toMoxfield(deck: CardOption[]): string {
  const selectedCards = deck
    .map(
      (card) =>
        `${card.quantity} ${card.cardName} (${card.setCode.toUpperCase()}) ${card.collectorNumber}${card.selectedTreatment === Treatment.Foil ? " *f*" : ""}`,
    )
    .join("\n");

  return selectedCards;
}
