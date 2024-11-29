import { Finish, Printing, Card } from "@/__generated__/graphql";
import { fetchCardPrintings } from "@/api/manaql/cache";
import { parsePrice } from "@/lib/utils";
import {
  Submission,
  DeckPricingResult,
  CardOption,
  Currency,
  Exclusion,
} from "@/types";

export class BlingService {
  private localCurrency: Currency;
  private exclusions: Exclusion[];

  constructor(localCurrency: Currency, exclusions: Exclusion[]) {
    this.localCurrency = localCurrency;
    this.exclusions = exclusions;
  }

  async processDecklist(submission: Submission): Promise<DeckPricingResult> {
    const cardMap: { [name: string]: CardOption[] } = {};
    const blingMap: { [name: string]: CardOption } = {};

    const cardNames = submission.decklist.map((card) => card.name);
    const cardPrintings = await fetchCardPrintings(cardNames, submission.treatments); // this.exclusions

    cardNames.forEach((cardName) => {
      const cards = cardPrintings[cardName] || [];
      const options = this.processCardPrintings(
        cards,
        submission,
        submission.treatments
      );
      cardMap[cardName] = options;

      const mostExpensiveOption = this.findMostExpensiveOption(
        options,
        submission.treatments
      );
      if (mostExpensiveOption) {
        blingMap[cardName] = mostExpensiveOption;
      }
    });

    return this.calculateDeckStats(submission, cardMap, blingMap);
  }

  private processCardPrintings(
    cards: Card[],
    submission: Submission,
    allowedTreatments: Finish[]
  ): CardOption[] {
    return cards.flatMap((card) => {
      // Find the matching submission card
      const submissionCard = submission.decklist.find(
        (dc) => dc.name === card.name
      );
      if (!submissionCard || !card.printings?.edges) return [];

      return card.printings.edges
        .map((edge) => edge?.node)
        .filter((node): node is Printing => !!node)
        .filter(
          (printing) =>
            // Filter by set if specified
            !submissionCard.set || printing.setName === submissionCard.set
        )
        .filter(
          (printing) =>
            // Filter by collector number if specified
            !submissionCard.collectorNumber ||
            printing.collectorNumber === submissionCard.collectorNumber
        )
        .map((printing) => ({
          id: printing.id,
          cardName: card.name || "",
          cardType: card.mainType || "",
          setName: printing.setName || "",
          setCode: printing.set || "",
          collectorNumber: printing.collectorNumber || "",
          image: printing.imageUri || "",
          quantity: submissionCard.quantity,
          requestedSet: submissionCard.set,
          requestedCollectorNumber: submissionCard.collectorNumber,
          selected: false,
          treatments: allowedTreatments.map((treatment) => ({
            name: treatment,
            price: parsePrice(this.getPriceForTreatment(printing, treatment)),
            available: this.isTreatmentAvailable(printing, treatment),
          })),
        }));
    });
  }

  private getPriceForTreatment(
    printing: Printing,
    treatment: Finish
  ): number | null {
    if (this.localCurrency === Currency.EUR) {
      switch (treatment) {
        case Finish.Nonfoil:
          return printing.priceEur || null;
        case Finish.Foil:
          return printing.priceEurFoil || null;
        default:
          return printing.priceEurEtched || null;
      }
    }

    switch (treatment) {
      case Finish.Nonfoil:
        return printing.priceUsd || null;
      case Finish.Foil:
        return printing.priceUsdFoil || null;
      case Finish.Etched:
        return printing.priceUsdEtched || null;
    }
  }

  private isTreatmentAvailable(printing: Printing, treatment: Finish): boolean {
    if (!printing.finishes) return false;

    switch (treatment) {
      case Finish.Nonfoil:
        return printing.finishes.includes(Finish.Nonfoil);
      case Finish.Foil:
        return printing.finishes.includes(Finish.Foil);
      case Finish.Etched:
        return printing.finishes.includes(Finish.Etched);
    }
  }

  private findMostExpensiveOption(
    options: CardOption[],
    allowedTreatments: Finish[]
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
    blingMap: { [name: string]: CardOption }
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
          (t) => t.name === card.selectedTreatment
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

    const missingCards = submission.decklist
      .map((card) => card.name)
      .filter((name) => blingMap[name] === undefined);

    return {
      bling: blingMap,
      cards: cardMap,
      totalPrice,
      missingPrices,
      stats: {
        totalCards,
        uniqueCards: Object.keys(cardMap).length,
        selectedCards,
        missingCards: missingCards,
        numMissingCards: missingCards.length,
      },
    };
  }

  getBlingPrice(result: DeckPricingResult): number {
    return Object.values(result.bling).reduce((total, card) => {
      const treatment = card.treatments.find(
        (t) => t.name === card.selectedTreatment
      );
      return total + (treatment?.price || 0) * card.quantity;
    }, 0);
  }
}
