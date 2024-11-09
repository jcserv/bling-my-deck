import { ScryfallClient, ScryfallCard } from "@/api/scryfall/client";
import { Submission, DeckPricingResult, CardOption, Card, Treatment } from "@/types";

export class BlingService {
  constructor(private scryfallClient: ScryfallClient) {}

  async processDecklist(submission: Submission): Promise<DeckPricingResult> {
    const cardMap: { [name: string]: CardOption[] } = {};
    const blingMap: { [name: string]: CardOption } = {};

    await Promise.all(
      submission.decklist.map(async (card) => {
        const printings = await this.scryfallClient.getAllPrintings(card.name);
        const options = this.processCardPrintings(printings, card, submission.treatments);
        cardMap[card.name] = options;
        
        const mostExpensiveOption = this.findMostExpensiveOption(
          options,
          submission.treatments
        );
        if (mostExpensiveOption) {
          blingMap[card.name] = mostExpensiveOption;
        }
      })
    );

    return this.calculateDeckStats(cardMap, blingMap);
  }

  private processCardPrintings(
    printings: ScryfallCard[],
    submissionCard: Card,
    allowedTreatments: Treatment[]
  ): CardOption[] {
    return printings
      .filter(printing => 
        !submissionCard.set || printing.set_name === submissionCard.set
      )
      .filter(printing =>
        !submissionCard.collectorNumber || 
        printing.collector_number === submissionCard.collectorNumber
      )
      .map(printing => ({
        id: printing.id,
        cardName: printing.name,
        cardType: this.parseMainCardType(printing.type_line),
        setName: printing.set_name,
        setCode: printing.set,
        collectorNumber: printing.collector_number,
        image: printing.image_uris?.normal,
        quantity: submissionCard.quantity,
        requestedSet: submissionCard.set,
        requestedCollectorNumber: submissionCard.collectorNumber,
        selected: false,
        treatments: allowedTreatments.map(treatment => ({
          name: treatment,
          price: this.parsePrice(this.getPriceForTreatment(printing, treatment)),
          available: this.isTreatmentAvailable(printing, treatment)
        }))
      }));
  }

  private parsePrice(price: string | null): number | null {
    if (!price) return null;
    return parseFloat(price);
  }

  private parseMainCardType(type_line: string | undefined): string {
    if (!type_line) return '';

    const typeMapping: { [key: string]: string } = {
      'Artifact Creature': 'Creature',
      'Artifact Land': 'Land',
      'Basic Land': 'Land',
      'Basic Snow Land': 'Land',
      'Enchantment Creature': 'Creature',
      'Enchantment Land': 'Land',
      'Land Creature': 'Land',
      'Legendary Land': 'Land',
      'Legendary Artifact': 'Artifact',
      'Legendary Enchantment': 'Enchantment',
      'Legendary Artifact Creature': 'Creature',
      'Legendary Creature': 'Creature',
      'Legendary Planeswalker': 'Planeswalker'
    };

    const mainType = type_line.split(' // ')[0].split(' — ')[0];
    return typeMapping[mainType] || mainType;
  }

  private getPriceForTreatment(card: ScryfallCard, treatment: Treatment): string | null {
    switch (treatment) {
      case Treatment.Normal: return card.prices.usd;
      case Treatment.Foil: return card.prices.usd_foil;
      case Treatment.Etched: return card.prices.usd_etched;
    }
  }

  private isTreatmentAvailable(card: ScryfallCard, treatment: Treatment): boolean {
    switch (treatment) {
      case Treatment.Normal: return card.finishes.includes('nonfoil');
      case Treatment.Foil: return card.finishes.includes('foil');
      case Treatment.Etched: return card.finishes.includes('etched');
    }
  }

  private findMostExpensiveOption(
    options: CardOption[],
    allowedTreatments: Treatment[]
  ): CardOption | undefined {
    let maxPrice = -1;
    let expensiveOption: CardOption | undefined;

    options.forEach(option => {
      option.treatments.forEach(treatment => {
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
            selectedTreatment: treatment.name
          };
        }
      });
    });
    return expensiveOption;
  }

  private calculateDeckStats(
    cardMap: { [name: string]: CardOption[] },
    blingMap: { [name: string]: CardOption }
  ): DeckPricingResult {
    let totalPrice = 0;
    let missingPrices = false;
    let selectedCards = 0;
    let unavailableTreatments = 0;
    let totalCards = 0;

    Object.values(blingMap).flat().forEach(card => {
      if (!card.selected || !card.selectedTreatment) return;

      const treatment = card.treatments.find(t => t.name === card.selectedTreatment);
      if (treatment) {
        if (treatment.price === null) {
          missingPrices = true;
        } else {
          totalPrice += treatment.price * card.quantity;
        }
        if (!treatment.available) {
          unavailableTreatments++;
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
        unavailableTreatments
      }
    };
  }

  updateCardSelection(
    result: DeckPricingResult,
    cardName: string,
    printingId: string,
    selected: boolean,
    treatment?: Treatment
  ): DeckPricingResult {
    const updatedCards = { ...result.cards };
    
    if (updatedCards[cardName]) {
      updatedCards[cardName] = updatedCards[cardName].map(card => {
        if (card.id === printingId) {
          return {
            ...card,
            selected,
            selectedTreatment: treatment || card.selectedTreatment
          };
        }
        return card;
      });
    }

    return this.calculateDeckStats(updatedCards, result.bling);
  }

  getBlingPrice(result: DeckPricingResult): number {
    return Object.values(result.bling).reduce((total, card) => {
      const treatment = card.treatments.find(t => t.name === card.selectedTreatment);
      return total + (treatment?.price || 0) * card.quantity;
    }, 0);
  }
}