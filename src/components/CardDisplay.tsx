import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, Card } from "@/components/ui";
import { Finish } from "@/__generated__/graphql";
import { CardOption } from "@/types";


interface CardDisplayProps {
  selectedCard: CardOption | null;
  allPrintings?: CardOption[];
  onPrintingChange?: (cardName: string, newPrinting: CardOption) => void;
}

export const CardDisplay = ({
  selectedCard,
  allPrintings,
  onPrintingChange,
}: CardDisplayProps) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (allPrintings?.length && selectedCard) {
      const index = allPrintings.findIndex(
        (card) => card.id === selectedCard.id,
      );
      setCurrentIndex(index !== -1 ? index : 0);
    }
  }, [selectedCard?.id, allPrintings]);

  const handlePrevious = () => {
    if (!selectedCard || !allPrintings || !onPrintingChange) return;

    const newIndex =
      currentIndex <= 0 ? allPrintings.length - 1 : currentIndex - 1;
    onPrintingChange(selectedCard.cardName, allPrintings[newIndex]);
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    if (!selectedCard || !allPrintings || !onPrintingChange) return;

    const newIndex =
      currentIndex >= allPrintings.length - 1 ? 0 : currentIndex + 1;
    onPrintingChange(selectedCard.cardName, allPrintings[newIndex]);
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative">
      <Card className="aspect-[745/1040] bg-gray-100">
        {!selectedCard && (
          <div className="flex items-center text-center justify-center h-full text-gray-500">
            Hover over a card to see its image
          </div>
        )}
        {selectedCard?.selectedTreatment === Finish.Foil ? (
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
          selectedCard && (
            <img
              src={selectedCard.image}
              alt={selectedCard.cardName}
              className="w-full h-full object-contain"
            />
          )
        )}
      </Card>
      {selectedCard && allPrintings && allPrintings.length > 1 && (
        <>
          <Button
            aria-label="Click to view previous printing"
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Click to view previous printing"
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded text-sm">
            {allPrintings[currentIndex]?.setName} ({currentIndex + 1}/
            {allPrintings.length})
          </div>
        </>
      )}
    </div>
  );
};
