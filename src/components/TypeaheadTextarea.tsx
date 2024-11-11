import * as React from "react";
import { Loader2 } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { useAutocomplete } from "@/hooks/autocomplete";
import { cn } from "@/lib/utils";

interface TypeaheadTextareaProps extends React.ComponentProps<typeof Textarea> {
  className?: string;
}

export const TypeaheadTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TypeaheadTextareaProps
>(({ className, onChange, value, ...props }, forwardedRef) => {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const localRef = React.useRef<HTMLTextAreaElement | null>(null);

  const textareaRef = React.useMemo(() => {
    return (node: HTMLTextAreaElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };
  }, [forwardedRef]);

  const { data: suggestions, isLoading } = useAutocomplete(query);

  const getCurrentLineQuery = (value: string, selectionStart: number) => {
    const lines = value.slice(0, selectionStart).split("\n");
    const currentLine = lines[lines.length - 1];
    return currentLine.replace(/^\d+\s*/, "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newQuery = getCurrentLineQuery(
      e.target.value,
      e.target.selectionStart,
    );
    setQuery(newQuery);
    setSelectedIndex(0);
    onChange?.(e);
  };

  const handleSelect = (selectedValue: string) => {
    const textarea = localRef.current;
    if (!textarea) return;

    const { selectionStart } = textarea;
    const currentValue = String(value ?? "");
    const lines = currentValue.slice(0, selectionStart).split("\n");
    const currentLine = lines[lines.length - 1];
    const prefix = currentLine.match(/^\d+\s*/)?.[0] || "";

    const beforeLines = lines.slice(0, -1);
    const afterLines = currentValue.slice(selectionStart).split("\n").slice(1);

    const newValue = [
      ...beforeLines,
      `${prefix}${selectedValue}`,
      ...afterLines,
    ].join("\n");

    if (onChange) {
      const syntheticEvent = {
        target: { value: newValue },
        currentTarget: { value: newValue },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      onChange(syntheticEvent);
    }

    setQuery("");
    setSelectedIndex(0);
    textarea.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!suggestions?.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (i) => (i - 1 + suggestions.length) % suggestions.length,
        );
        break;
      case "Enter":
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          handleSelect(suggestions[selectedIndex]);
        }
        break;
    }
  };

  const getDropdownPosition = () => {
    const textarea = localRef.current;
    if (!textarea) return { top: 0, left: 0 };

    const { selectionStart } = textarea;
    const currentValue = String(value ?? "");
    const textBeforeCaret = currentValue.slice(0, selectionStart);
    const lines = textBeforeCaret.split("\n");
    const currentLineNumber = lines.length;

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight);
    const paddingTop = parseInt(computedStyle.paddingTop);

    const top = paddingTop + lineHeight * currentLineNumber;
    const left = parseInt(computedStyle.paddingLeft);

    return { top, left };
  };

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        className={className}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={value}
        {...props}
      />
      {query.length >= 2 && (
        <div
          className="absolute z-50 min-w-[200px] max-w-[400px] rounded-md border bg-popover p-1 shadow-md"
          style={getDropdownPosition()}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(suggestion);
                  }}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground",
                    index === selectedIndex &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
});

TypeaheadTextarea.displayName = "TypeaheadTextarea";
