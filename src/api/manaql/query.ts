import gql from "graphql-tag";

export const GET_CARDS_QUERY = gql`
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

export const AUTOCOMPLETE_QUERY = gql`
query Autocomplete($filter: CardFilter!, $first: Int) {
  cards(filter: $filter, first: $first) {
    edges {
      node {
        cardId
        name
      }
    }
  }
}
`;