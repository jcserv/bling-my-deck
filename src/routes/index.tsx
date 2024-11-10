import { CartForm } from "@/components/CartForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";

type Params = {
  error: string;
};

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>): Params | null => ({
    error: search?.error as string,
  }),
});

function Index() {
  const params = Route.useSearch();
  const error = params?.error as string;
  return (
    <section className="p-2 md:p-4">
      <div className="min-h-[80vh] w-full flex flex-col items-center">
        {!error ? (
          <Alert className="w-1/2 max-w-4xl bg-blue-400 dark:bg-blue-600 my-4 md:my-8">
            <Info className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription className="space-y-1">
              <p>
                Enter the cards you want to bling out, and we&apos;ll show you
                all of the most expensive printings available for each card, as
                well as the total cost.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="w-1/2 max-w-4xl bg-red-400 dark:bg-red-600 my-4 md:my-8">
            <Info className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="space-y-1">
              <p>
                Unable to retrieve printings for a card, please try again and
                ensure the name matches exactly.
              </p>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Click to View Details</AccordionTrigger>
                  <AccordionContent>
                    <pre>{error}</pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AlertDescription>
          </Alert>
        )}
        <CartForm />
      </div>
    </section>
  );
}

export default Index;
