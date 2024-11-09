import { Card } from "@/components/ui/card";
import { CardOption, Treatment } from "@/types";

interface CardDisplayProps {
  selectedCard: CardOption | null;
}

export const CardDisplay = ({ selectedCard }: CardDisplayProps) => (
  <Card className="aspect-[745/1040] bg-gray-100">
    {!selectedCard && (
      <div className="flex items-center text-center justify-center h-full text-gray-500">
        Hover over a card to see its image
      </div>
    )}
    {selectedCard?.selectedTreatment === Treatment.Foil ? (
      <div className="card-container">
        <div className="card">
          <img
            src={selectedCard.image}
            alt={selectedCard.cardName}
            className="w-full h-full object-contain"
          />
          <div className="foil-effect"></div>
          <div className="foil-overlay-1"></div>
          <div className="foil-overlay-2"></div>
          <div className="prismatic"></div>
          <div className="card-content"></div>
        </div>
      </div>
    ) : (
      <img
        src={selectedCard?.image}
        alt={selectedCard?.cardName}
        className="w-full h-full object-contain"
      />
    )}
  </Card>
);
