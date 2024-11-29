import { Finish } from "@/__generated__/graphql";
import { CardOption } from "@/types";

export function toMoxfield(deck: CardOption[]): string {
  const selectedCards = deck
    .map(
      (card) =>
        `${card.quantity} ${card.cardName} (${card.setCode.toUpperCase()}) ${card.collectorNumber}${card.selectedTreatment === Finish.Foil ? " *f*" : ""}`
    )
    .join("\n");

  return selectedCards;
}
