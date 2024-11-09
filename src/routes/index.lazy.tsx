import { CartForm } from "@/components/CartForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <section className="p-2 text-center">
      <div className="h-[80vh] w-screen flex flex-col items-center">
        <div className="flex flex-row">
        <Alert className="text-start bg-blue-400 dark:bg-blue-600 my-8">
            <Info className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              Enter the cards you want to bling out, and we&apos;ll show you <br />
              all of the most expensive printings available for each card, as well as <br />
              the total cost.
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex flex-row">
          <CartForm />
        </div>
      </div>
    </section>
  );
}
