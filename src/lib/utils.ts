import { CardOption } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parsePrice(price: number | string | null): number | null {
  if (!price) return null;
  const parsed = parseFloat(price.toString());
  return isNaN(parsed) ? null : parsed;
}

// Helper method to safely format price
function formatPrice(price: number | null): string {
  if (price === null) return "N/A";
  return price.toFixed(2);
}

// Use this method to safely get formatted price from a card option
export function getFormattedPrice(cardOption: CardOption): string {
  const treatment = cardOption.treatments.find(
    (t) => t.name === cardOption.selectedTreatment
  );
  return formatPrice(treatment?.price ?? null);
}