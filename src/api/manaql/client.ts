import {
  ApolloClient,
  ApolloQueryResult,
  NormalizedCacheObject,
} from "@apollo/client";

import {
  Card,
  CardField,
  CardsQuery,
  CardsQueryVariables,
  FilterOperator,
} from "@/__generated__/graphql";
// import { Exclusion } from "@/types";
import { AUTOCOMPLETE_QUERY, GET_CARDS_QUERY } from "./query";

export class ManaqlClient {
  private apolloClient: ApolloClient<NormalizedCacheObject>;

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>) {
    this.apolloClient = apolloClient;
  }

  async getAllPrintings(cardNames: string[]): Promise<Card[]> {
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
          },
        });

      // Transform the edges/nodes structure into a flat array of cards
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
      const { data } = await this.apolloClient.query({
        query: AUTOCOMPLETE_QUERY,
        variables: { query },
      });
      return data.cards.map((card: Card) => card.name);
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
