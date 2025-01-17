import { CardPricingService } from "./types";
import { Currency, Exclusion, DeckPricingResult, CardOption, Submission } from "@/types";
import { fetchCardPrintings } from "@/api/scryfall/cache";
import { Card, Finish, Printing } from "@/__generated__/graphql";

export class ScryfallPricingService implements CardPricingService {
  private localCurrency: Currency;
  private exclusions: Exclusion[];

  constructor(localCurrency: Currency, exclusions: Exclusion[]) {
    this.localCurrency = localCurrency;
    this.exclusions = exclusions;
  }

  async processDecklist(submission: Submission): Promise<DeckPricingResult> {
    const cardMap: { [name: string]: CardOption[] } = {};
    const blingMap: { [name: string]: CardOption } = {};

    // Process cards in parallel
    const promises = submission.decklist.map(async (card) => {
      try {
        const printings = await fetchCardPrintings(card.name, this.exclusions);
        const options = this.processCardPrintings(
          printings,
          card,
          submission.treatments
        );
        return { name: card.name, options };
      } catch (error) {
        console.error(`Error fetching printings for ${card.name}:`, error);
        return { name: card.name, options: [] };
      }
    });

    const results = await Promise.all(promises);

    // Process results
    results.forEach(({ name, options }) => {
      if (options.length > 0) {
        cardMap[name] = options;

        const mostExpensiveOption = this.findMostExpensiveOption(
          options,
          submission.treatments
        );
        if (mostExpensiveOption) {
          blingMap[name] = mostExpensiveOption;
        }
      }
    });

    return this.calculateDeckStats(submission, cardMap, blingMap);
  }

  private processCardPrintings(
    cards: Card[],
    submissionCard: { name: string; quantity: number; set?: string; collectorNumber?: string },
    allowedTreatments: Finish[]
  ): CardOption[] {
    return cards.flatMap((card) => {
      const printings = card.printings?.edges?.map(edge => edge?.node).filter((p): p is Printing => !!p) || [];
      
      return printings
        .filter(printing => 
          (!submissionCard.set || printing.setName === submissionCard.set) &&
          (!submissionCard.collectorNumber || printing.collectorNumber === submissionCard.collectorNumber)
        )
        .map((printing): CardOption => ({
          id: printing.id,
          cardName: card.name || "",
          cardType: card.mainType || "",
          setName: printing.setName || "",
          setCode: printing.set || "",
          collectorNumber: printing.collectorNumber || "",
          image: printing.imageUri || "",
          quantity: submissionCard.quantity,
          selected: false,
          treatments: allowedTreatments.map(treatment => ({
            name: treatment,
            price: this.getPriceForTreatment(printing, treatment),
            available: this.isTreatmentAvailable(printing, treatment)
          }))
        }));
    });
  }

  private getPriceForTreatment(printing: Printing, treatment: Finish): number | null {
    if (this.localCurrency === Currency.EUR) {
      switch (treatment) {
        case Finish.Nonfoil:
          return printing.priceEur;
        case Finish.Foil:
          return printing.priceEurFoil;
        case Finish.Etched:
          return printing.priceEurEtched;
      }
    }

    switch (treatment) {
      case Finish.Nonfoil:
        return printing.priceUsd;
      case Finish.Foil:
        return printing.priceUsdFoil;
      case Finish.Etched:
        return printing.priceUsdEtched;
    }
  }

  private isTreatmentAvailable(printing: Printing, treatment: Finish): boolean {
    return printing.finishes?.includes(treatment) || false;
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

    Object.values(blingMap).forEach((card) => {
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
      .filter((name) => !blingMap[name]);

    return {
      cards: cardMap,
      bling: blingMap,
      totalPrice,
      missingPrices,
      stats: {
        totalCards,
        uniqueCards: Object.keys(cardMap).length,
        selectedCards,
        missingCards,
        numMissingCards: missingCards.length,
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