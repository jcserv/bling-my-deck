import { DeckPricingResult, Submission } from "@/types";

export interface CardPricingService {
  processDecklist(submission: Submission): Promise<DeckPricingResult>;
  getBlingPrice(result: DeckPricingResult): number;
}
