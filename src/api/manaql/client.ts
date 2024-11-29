import {
  ApolloClient,
  ApolloQueryResult,
  NormalizedCacheObject,
} from "@apollo/client";

import {
  AutocompleteQuery,
  AutocompleteQueryVariables,
  Card,
  CardField,
  CardsQuery,
  CardsQueryVariables,
  FilterOperator,
  Finish,
} from "@/__generated__/graphql";
// import { Exclusion } from "@/types";
import { AUTOCOMPLETE_QUERY, GET_CARDS_QUERY, getPrintingFilters } from "./query";

export class ManaqlClient {
  private apolloClient: ApolloClient<NormalizedCacheObject>;

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>) {
    this.apolloClient = apolloClient;
  }

  async getAllPrintings(cardNames: string[], treatments: Finish[]): Promise<Card[]> {
    try {
      const { data }: ApolloQueryResult<CardsQuery> =
        await this.apolloClient.query<CardsQuery, CardsQueryVariables>({
          query: GET_CARDS_QUERY,
          variables: {
            first: 100,
            filter: {
              fields: [CardField.Name],
              operator: FilterOperator.Eq,
              query: cardNames,
            },
            printingsFirst: 750,
            printingFilters: getPrintingFilters(treatments),
          },
        });

      return (data.cards?.edges?.flatMap((edge) =>
        edge?.node ? [edge.node] : []
      ) ?? []) as Card[];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getCardNamesByAutocomplete(query: string): Promise<string[]> {
    try {
      const { data }: ApolloQueryResult<AutocompleteQuery> =
        await this.apolloClient.query<
          AutocompleteQuery,
          AutocompleteQueryVariables
        >({
          query: AUTOCOMPLETE_QUERY,
          variables: {
            first: 10,
            filter: {
              fields: [CardField.Name],
              operator: FilterOperator.Sw,
              query: [query],
            },
          },
        });
      return (
        data.cards?.edges
          ?.filter((edge) => edge?.node?.name != null)
          .map((edge) => edge?.node?.name as string) ?? []
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
