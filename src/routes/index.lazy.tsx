import { CartForm } from "@/components/CartForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <section className="p-2 md:p-4">
      <div className="min-h-[80vh] w-full flex flex-col items-center">
        <Alert className="w-1/2 max-w-4xl bg-blue-400 dark:bg-blue-600 my-4 md:my-8">
          <Info className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription className="space-y-1">
            <p>
              Enter the cards you want to bling out, and we&apos;ll show you all
              of the most expensive printings available for each card, as well
              as the total cost.
            </p>
          </AlertDescription>
        </Alert>
        <CartForm />
      </div>
    </section>
  );
}

export default Index;
