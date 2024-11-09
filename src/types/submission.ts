import { Card } from "./card";
import { Treatment } from "./treatment";

export type Submission = {
    decklist: Card[];
    treatments: Treatment[];
    localCurrency: string;
}