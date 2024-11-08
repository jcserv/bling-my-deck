import { CartForm } from "@/components/CartForm";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <section className="p-2 text-center">
      <div className="h-screen w-screen flex items-center justify-center">
        <CartForm />
      </div>
    </section>
  );
}