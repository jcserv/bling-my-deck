import * as React from "react";
import { debounce } from "lodash";

import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAutocomplete } from "@/hooks/cardPrintings";

interface TypeaheadState {
  word: string;
  startPosition: number;
  endPosition: number;
}

// Helper to get current word and its position
const getCurrentWord = (
  text: string,
  cursorPosition: number
): TypeaheadState => {
  const textBeforeCursor = text.slice(0, cursorPosition);
  const words = textBeforeCursor.split(/\s/);
  const currentWord = words[words.length - 1];
  const startPosition = textBeforeCursor.length - currentWord.length;

  return {
    word: currentWord,
    startPosition,
    endPosition: startPosition + currentWord.length,
  };
};

export const TypeaheadTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & {
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  }
>(({ className, onChange, ...props }, ref) => {
  // Internal state
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPosition, setCurrentPosition] = React.useState(0);
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  const combinedRef = useCombinedRefs(ref, internalRef);

  const { data: suggestions, isLoading } = useAutocomplete(searchTerm);

  const debouncedSearch = React.useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;

    if (onChange) {
      onChange(e);
    }

    setCurrentPosition(cursorPosition);

    const { word } = getCurrentWord(newValue, cursorPosition);
    if (word.length >= 2) {
      setIsOpen(true);
      debouncedSearch(word);
    } else {
      setIsOpen(false);
    }
  };

  // Handle suggestion selection
  const handleSelect = (selectedValue: string) => {
    if (!internalRef.current) return;

    const textarea = internalRef.current;
    const currentValue = textarea.value;
    const { startPosition, endPosition } = getCurrentWord(
      currentValue,
      currentPosition
    );

    const newValue =
      currentValue.slice(0, startPosition) +
      selectedValue +
      currentValue.slice(endPosition);

    const syntheticEvent = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    if (onChange) {
      onChange(syntheticEvent);
    }

    const newPosition = startPosition + selectedValue.length;
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
    setCurrentPosition(newPosition);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <Textarea
            ref={combinedRef}
            className={className}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            {...props}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start" side="bottom">
        <Command>
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No results found."}
            </CommandEmpty>
            <CommandGroup>
              {suggestions?.map((suggestion: string) => (
                <CommandItem
                  key={suggestion}
                  value={suggestion}
                  onSelect={handleSelect}
                >
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

TypeaheadTextarea.displayName = "TypeaheadTextarea";

function useCombinedRefs<T>(
  ...refs: Array<React.ForwardedRef<T> | React.RefObject<T>>
) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}
