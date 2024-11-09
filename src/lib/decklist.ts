import { CardOption } from "@/types";

export function toMoxfield(deck: CardOption[]): string {
  const selectedCards = deck
    .filter((card) => card.selected)
    .map(
      (card) =>
        `${card.quantity} ${card.cardName} (${card.setCode.toUpperCase()}) ${card.collectorNumber}`
    )
    .join("\n");

  return selectedCards;
}
