import { Github } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between m-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        <Link to="/">Bling My Deck ✨</Link>
      </h1>
      <div className="space-x-2">
        <Button
          variant="ghost"
          className="p-2"
          aria-label="Open Github Repo"
          onClick={() => {
            window.open(
              "https://github.com/jcserv/bling-my-deck",
              "_blank",
            );
          }}
        >
          <Github className="w-4 h-4" />
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
};
