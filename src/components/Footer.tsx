export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="flex items-center justify-center">
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
      </div>
    </footer>
  );
};
