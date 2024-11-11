export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="flex flex-col items-center justify-center m-8 text-center">
        <span>
          <p
            className="m-2 cursor-pointer"
            onClick={() => {
              window.open("https://jarrodservilla.com", "_blank");
            }}
          >
            Made with{" "}
            <span aria-label="heart" role="img">
              &#128153;
            </span>
            {" (and Food tokens) by Jarrod Servilla"}
          </p>
        </span>
        <span>
          <p className="text-sm text-muted-foreground">
            Bling My Deck is unofficial Fan Content permitted under the{" "}
            <a
              href="https://company.wizards.com/en/legal/fancontentpolicy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Fan Content Policy
            </a>
            . Not approved/endorsed by Wizards.
          </p>
          <p className="text-sm text-muted-foreground">
            Portions of the materials used are property of Wizards of the Coast.
            © Wizards of the Coast LLC.
          </p>
        </span>
        <span>
          <p className="text-sm text-muted-foreground mb-4">
            This website uses{" "}
            <a
              href="https://scryfall.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Scryfall
            </a>{" "}
            to provide card data & images. Scryfall is not produced by or
            endorsed by Wizards of the Coast.
          </p>
        </span>
      </div>
    </footer>
  );
};
