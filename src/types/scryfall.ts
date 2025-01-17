import { Card, CardType, Finish, Printing } from "@/__generated__/graphql";

type ImageURIs = {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
};

type CardFace = {
  image_uris: ImageURIs;
};

export interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  prices: {
    usd: string | null;
    usd_foil: string | null;
    usd_etched: string | null;
    eur: string | null;
    eur_foil: string | null;
    eur_etched: string | null;
  };
  finishes: string[];
  set_name: string;
  set: string;
  collector_number: string;
  card_faces: CardFace[];
  image_uris: ImageURIs | null;
}

export function scryfallToCard(scryfallCard: ScryfallCard): Card {
  return {
    __typename: "card",
    id: scryfallCard.id,
    cardId: scryfallCard.id,
    name: scryfallCard.name,
    mainType: parseMainCardType(scryfallCard.type_line),
    printings: {
      __typename: "cardPrintingsConnection",
      edges: [{
        __typename: "cardPrintingsConnectionEdge",
        cursor: "1",
        node: scryfallToPrinting(scryfallCard)
      }],
      pageInfo: {
        __typename: "PageInfo",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null
      }
    }
  };
}

export function scryfallCardsToCards(scryfallCards: ScryfallCard[]): Card[] {
  return scryfallCards.map((c) => scryfallToCard(c))
}

export function scryfallToPrinting(scryfallCard: ScryfallCard): Printing {
  return {
    __typename: "printing",
    id: scryfallCard.id,
    printingId: scryfallCard.id,
    set: scryfallCard.set,
    setName: scryfallCard.set_name,
    finishes: scryfallCard.finishes.map(finish => {
      if (finish === 'nonfoil') return Finish.Nonfoil;
      if (finish === 'foil') return Finish.Foil;
      return Finish.Etched;
    }),
    imageUri: scryfallCard.image_uris?.normal || scryfallCard.card_faces?.[0].image_uris?.normal,
    backImageUri: scryfallCard.card_faces?.[1]?.image_uris?.normal || null,
    // Convert prices
    priceUsd: scryfallCard.prices.usd ? parseFloat(scryfallCard.prices.usd) : null,
    priceUsdFoil: scryfallCard.prices.usd_foil ? parseFloat(scryfallCard.prices.usd_foil) : null,
    priceUsdEtched: scryfallCard.prices.usd_etched ? parseFloat(scryfallCard.prices.usd_etched) : null,
    priceEur: scryfallCard.prices.eur ? parseFloat(scryfallCard.prices.eur) : null,
    priceEurFoil: scryfallCard.prices.eur_foil ? parseFloat(scryfallCard.prices.eur_foil) : null,
    priceEurEtched: null, // Scryfall doesn't provide EUR etched prices
    collectorNumber: scryfallCard.collector_number
  };
}

function parseMainCardType(type_line: string | undefined): CardType {
  if (!type_line) return CardType.Unknown;
  if (type_line.includes("Planeswalker")) return CardType.Planeswalker;
  if (type_line.includes("Battle")) return CardType.Battle;
  if (type_line.includes("Land")) return CardType.Land;
  if (type_line.includes("Creature")) return CardType.Creature;
  if (type_line.includes("Artifact")) return CardType.Artifact;
  if (type_line.includes("Enchantment")) return CardType.Enchantment;
  if (type_line.includes("Sorcery")) return CardType.Sorcery;
  if (type_line.includes("Instant")) return CardType.Instant;
  
  return CardType.Unknown;
}

export enum Treatment {
  Normal = "Normal",
  Foil = "Foil",
  Etched = "Etched",
}
