import gql from "graphql-tag";

export const CardsQuery = gql`
query Cards($first: Int, $filter: CardFilter, $printingsFirst: Int) {
  cards(first: $first, filter: $filter) {
    edges {
      node {
        id
        cardId
        name
        mainType
        printings(first: $printingsFirst) {
          edges {
            node {
              id
              printingId
              set
              setName
              finishes
              imageUri
              backImageUri
              priceUsd
              priceUsdFoil
              priceUsdEtched
              priceEur
              priceEurFoil
              priceEurEtched
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
  }
}
`;