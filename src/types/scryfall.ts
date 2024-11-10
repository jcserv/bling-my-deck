type ImageURIs = {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
};

type CardFace = {
  image_uris: ImageURIs;
};

export interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  prices: {
    usd: string | null;
    usd_foil: string | null;
    usd_etched: string | null;
  };
  finishes: string[];
  set_name: string;
  set: string;
  collector_number: string;
  card_faces: CardFace[];
  image_uris: ImageURIs | null;
}
