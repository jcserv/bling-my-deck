import {
  FilterOperator,
  Finish,
  PrintingField,
  PrintingFilter,
} from "@/__generated__/graphql";
import { Exclusion } from "@/types";
import gql from "graphql-tag";

export const GET_CARDS_QUERY = gql`
  query Cards(
    $first: Int
    $filter: CardFilter
    $printingsFirst: Int
    $printingFilters: [PrintingFilter!]
  ) {
    cards(first: $first, filter: $filter) {
      edges {
        node {
          id
          cardId
          name
          mainType
          printings(first: $printingsFirst, filters: $printingFilters) {
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

export function getTreatmentFilter(treatments: Finish[]): PrintingFilter {
  return {
    fields: [PrintingField.Finishes],
    operator: FilterOperator.Co,
    query: treatments,
  };
}

export function getExclusionFilters(exclusions: Exclusion[]): PrintingFilter[] {
  const filters: PrintingFilter[] = [];
  exclusions.forEach(exclusion => {
    if (exclusion === Exclusion.SecretLair) {
      filters.push({
        fields: [PrintingField.Set],
        operator: FilterOperator.Ne,
        query: ["sld"],
      });
    } else if (exclusion === Exclusion.Serialized) {
      filters.push({
        fields: [PrintingField.IsSerialized],
        operator: FilterOperator.Eq,
        query: ["false"],
      });
    }
  });
  return filters;
}

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
