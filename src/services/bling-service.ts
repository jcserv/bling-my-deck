import { fetchCardPrintings } from "@/api/scryfall/cache";
import {
  Submission,
  DeckPricingResult,
  CardOption,
  Card,
  Treatment,
  Currency,
} from "@/types";
import { ScryfallCard } from "@/types/scryfall";

export class BlingService {
  private localCurrency: Currency;

  constructor(localCurrency: Currency) {
    this.localCurrency = localCurrency;
  }

  async processDecklist(submission: Submission): Promise<DeckPricingResult> {
    const cardMap: { [name: string]: CardOption[] } = {};
    const blingMap: { [name: string]: CardOption } = {};

    await Promise.all(
      submission.decklist.map(async (card) => {
        const printings = await fetchCardPrintings(card.name);
        const options = this.processCardPrintings(
          printings,
          card,
          submission.treatments,
        );
        cardMap[card.name] = options;

        const mostExpensiveOption = this.findMostExpensiveOption(
          options,
          submission.treatments,
        );
        if (mostExpensiveOption) {
          blingMap[card.name] = mostExpensiveOption;
        }
      }),
    );

    return this.calculateDeckStats(submission, cardMap, blingMap);
  }

  private processCardPrintings(
    printings: ScryfallCard[],
    submissionCard: Card,
    allowedTreatments: Treatment[],
  ): CardOption[] {
    return printings
      .filter(
        (printing) =>
          !submissionCard.set || printing.set_name === submissionCard.set,
      )
      .filter(
        (printing) =>
          !submissionCard.collectorNumber ||
          printing.collector_number === submissionCard.collectorNumber,
      )
      .map((printing: ScryfallCard) => ({
        id: printing.id,
        cardName: printing.name,
        cardType: this.parseMainCardType(printing.type_line),
        setName: printing.set_name,
        setCode: printing.set,
        collectorNumber: printing.collector_number,
        image: this.parseCardImage(printing),
        quantity: submissionCard.quantity,
        requestedSet: submissionCard.set,
        requestedCollectorNumber: submissionCard.collectorNumber,
        selected: false,
        treatments: allowedTreatments.map((treatment) => ({
          name: treatment,
          price: this.parsePrice(
            this.getPriceForTreatment(printing, treatment),
          ),
          available: this.isTreatmentAvailable(printing, treatment),
        })),
      }));
  }

  private parsePrice(price: string | null): number | null {
    if (!price) return null;
    return parseFloat(price);
  }

  private parseMainCardType(type_line: string | undefined): string {
    if (!type_line) return "";
    if (type_line.includes("Planeswalker")) return "Planeswalker";
    if (type_line.includes("Battle")) return "Battle";
    if (type_line.includes("Land")) return "Land";
    if (type_line.includes("Creature")) return "Creature";
    if (type_line.includes("Artifact")) return "Artifact";
    if (type_line.includes("Enchantment")) return "Enchantment";
    if (type_line.includes("Sorcery")) return "Sorcery";
    if (type_line.includes("Instant")) return "Instant";
    return "";
  }

  private parseCardImage(card: ScryfallCard): string | undefined {
    if (!card.card_faces) return card.image_uris?.normal;
    if (card.card_faces && card.card_faces[0].image_uris) {
      return card.card_faces[0].image_uris.normal;
    }
    return card.image_uris?.normal;
  }

  private getPriceForTreatment(
    card: ScryfallCard,
    treatment: Treatment,
  ): string | null {
    if (this.localCurrency === Currency.EUR) {
      switch (treatment) {
        case Treatment.Normal:
          return card.prices.eur;
        case Treatment.Foil:
          return card.prices.eur_foil;
        default:
          return card.prices.eur_etched;
      }
    }

    switch (treatment) {
      case Treatment.Normal:
        return card.prices.usd;
      case Treatment.Foil:
        return card.prices.usd_foil;
      case Treatment.Etched:
        return card.prices.usd_etched;
    }
  }

  private isTreatmentAvailable(
    card: ScryfallCard,
    treatment: Treatment,
  ): boolean {
    switch (treatment) {
      case Treatment.Normal:
        return card.finishes.includes("nonfoil");
      case Treatment.Foil:
        return card.finishes.includes("foil");
      case Treatment.Etched:
        return card.finishes.includes("etched");
    }
  }

  private findMostExpensiveOption(
    options: CardOption[],
    allowedTreatments: Treatment[],
  ): CardOption | undefined {
    let maxPrice = -1;
    let expensiveOption: CardOption | undefined;

    options.forEach((option) => {
      option.treatments.forEach((treatment) => {
        if (
          treatment.available &&
          treatment.price !== null &&
          allowedTreatments.includes(treatment.name) &&
          treatment.price > maxPrice
        ) {
          maxPrice = treatment.price;
          expensiveOption = {
            ...option,
            selected: true,
            selectedTreatment: treatment.name,
          };
        }
      });
    });
    return expensiveOption;
  }

  private calculateDeckStats(
    submission: Submission,
    cardMap: { [name: string]: CardOption[] },
    blingMap: { [name: string]: CardOption },
  ): DeckPricingResult {
    let totalPrice = 0;
    let missingPrices = false;
    let selectedCards = 0;
    let totalCards = 0;

    Object.values(blingMap)
      .flat()
      .forEach((card) => {
        if (!card.selected || !card.selectedTreatment) return;

        const treatment = card.treatments.find(
          (t) => t.name === card.selectedTreatment,
        );
        if (treatment) {
          if (treatment.price === null) {
            missingPrices = true;
          } else {
            totalPrice += treatment.price * card.quantity;
          }
          if (card.selected) {
            selectedCards++;
          }
          totalCards += card.quantity;
        }
      });

    return {
      bling: blingMap,
      cards: cardMap,
      totalPrice,
      missingPrices,
      stats: {
        totalCards,
        uniqueCards: Object.keys(cardMap).length,
        selectedCards,
        numMissingCards:
          submission.decklist.length - Object.keys(blingMap).length,
      },
    };
  }

  getBlingPrice(result: DeckPricingResult): number {
    return Object.values(result.bling).reduce((total, card) => {
      const treatment = card.treatments.find(
        (t) => t.name === card.selectedTreatment,
      );
      return total + (treatment?.price || 0) * card.quantity;
    }, 0);
  }
}
