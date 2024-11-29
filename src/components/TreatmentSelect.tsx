import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { CardOption } from "@/types";

const TreatmentSelect = ({
  card,
  onPrintingChange,
}: {
  card: CardOption;
  onPrintingChange: (cardName: string, treatment: string) => void;
  className?: string;
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const treatments = card.treatments.filter((t) => t.price);

  useEffect(() => {
    const selectedIndex = treatments.findIndex(
      (t) => t?.name === card.selectedTreatment,
    );
    if (selectedIndex !== -1) {
      setCurrentIndex(selectedIndex);
    }
  }, [card.cardName, card.selectedTreatment, treatments]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % treatments.length);
    onPrintingChange(
      card.cardName,
      treatments[(currentIndex + 1) % treatments.length]?.name,
    );
  };

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + treatments.length) % treatments.length,
    );
    onPrintingChange(
      card.cardName,
      treatments[(currentIndex - 1 + treatments.length) % treatments.length]
        ?.name,
    );
  };

  const handleSelectChange = (value: string) => {
    const newIndex = treatments.findIndex((t) => t?.name === value);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
      onPrintingChange(card.cardName, value);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!treatments.length || treatments.length <= 1) return;

      switch (event.key) {
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, treatments.length]);

  if (!treatments.length) return null;
  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <Select
            value={treatments[currentIndex]?.name}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="w-[160px] capitalize" aria-label="Treatment select">
              <SelectValue placeholder="Select finish" />
            </SelectTrigger>
            <SelectContent>
              {treatments.map((treatment) => (
                <SelectItem key={treatment.name} value={treatment.name} className="capitalize">
                  {treatment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {treatments.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TreatmentSelect;
