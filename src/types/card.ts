export type Card = {
  name: string;
  quantity: number;
  set?: string | undefined;
  collectorNumber?: string | undefined;
};

const cardlineRegex =
  /^(\d+)\s+(.+?)(?:\s+\(([A-Z0-9]+)\)\s+(\d+))?(?:\s+\[([A-Z0-9]+)\])?$/;

export function parseDeckList(input: string): Card[] {
  const lines = input.split("\n");
  const cards: Card[] = [];

  for (const line of lines) {
    const match = line.trim().match(cardlineRegex);
    if (match) {
      const [, quantity, name, set, collectorNumber, alternateSet] = match;
      cards.push({
        name,
        quantity: parseInt(quantity, 10),
        set: set || alternateSet || undefined,
        collectorNumber: collectorNumber || undefined,
      });
    }
  }

  return cards;
}
