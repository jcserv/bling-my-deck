/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any; }
  Decimal: { input: any; output: any; }
};

/** The fields of Card to apply the filter(s) on. */
export enum CardField {
  Name = 'name'
}

/** The filter to narrow down the results of a query. */
export type CardFilter = {
  fields: Array<CardField>;
  /** The operator to apply to the filter. Supported operators are `eq` and `sw`. */
  operator: FilterOperator;
  /** The query values to apply to the filter. */
  query: Array<Scalars['String']['input']>;
};

/** The type of card. */
export enum CardType {
  Artifact = 'Artifact',
  Battle = 'Battle',
  Conspiracy = 'Conspiracy',
  Creature = 'Creature',
  Dungeon = 'Dungeon',
  Enchantment = 'Enchantment',
  Instant = 'Instant',
  Kindred = 'Kindred',
  Land = 'Land',
  Phenomenon = 'Phenomenon',
  Plane = 'Plane',
  Planeswalker = 'Planeswalker',
  Scheme = 'Scheme',
  Sorcery = 'Sorcery',
  Unknown = 'Unknown',
  Vanguard = 'Vanguard'
}

/** The filter operator to apply. */
export enum FilterOperator {
  Co = 'co',
  Eq = 'eq',
  Ne = 'ne',
  Sw = 'sw'
}

/** The available finishes of a printing, can be either nonfoil, foil, or etched. */
export enum Finish {
  Etched = 'etched',
  Foil = 'foil',
  Nonfoil = 'nonfoil'
}

export type Node = {
  id: Scalars['ID']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Maybe<Scalars['String']['output']>;
};

/** The fields of Printing to apply the filter(s) on. */
export enum PrintingField {
  Finishes = 'finishes',
  Set = 'set'
}

/** The filter to narrow down the results of a query. */
export type PrintingFilter = {
  fields: Array<PrintingField>;
  /** The operator to apply to the filter. Supported operators are `eq`, `ne`, and `sw`. */
  operator: FilterOperator;
  /** The query values to apply to the filter. */
  query: Array<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  cards: Maybe<QueryCardsConnection>;
};


export type QueryCardsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  cardId: InputMaybe<Scalars['Int']['input']>;
  filter: InputMaybe<CardFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};

export type QueryCardsConnection = {
  __typename?: 'QueryCardsConnection';
  edges: Maybe<Array<Maybe<QueryCardsConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryCardsConnectionEdge = {
  __typename?: 'QueryCardsConnectionEdge';
  cursor: Scalars['String']['output'];
  node: Maybe<Card>;
};

export type Card = Node & {
  __typename?: 'card';
  /** The numeric unique identifier of a card. */
  cardId: Maybe<Scalars['ID']['output']>;
  /** A unique string identifier for a card, used for pagination. */
  id: Scalars['ID']['output'];
  /** The primary type of a card; can be used to group cards by type in a decklist. */
  mainType: Maybe<CardType>;
  /** The name of a card. */
  name: Maybe<Scalars['String']['output']>;
  /** The printings of a card. */
  printings: Maybe<CardPrintingsConnection>;
};


export type CardPrintingsArgs = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  filters: InputMaybe<Array<PrintingFilter>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  printingId: InputMaybe<Scalars['Int']['input']>;
};

export type CardPrintingsConnection = {
  __typename?: 'cardPrintingsConnection';
  edges: Maybe<Array<Maybe<CardPrintingsConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type CardPrintingsConnectionEdge = {
  __typename?: 'cardPrintingsConnectionEdge';
  cursor: Scalars['String']['output'];
  node: Maybe<Printing>;
};

export type Printing = Node & {
  __typename?: 'printing';
  /** The image URI of the back of a printing */
  backImageUri: Maybe<Scalars['String']['output']>;
  /** The collector number of a printing. */
  collectorNumber: Maybe<Scalars['String']['output']>;
  finishes: Maybe<Array<Finish>>;
  /** A unique string identifier for a printing, used for pagination. */
  id: Scalars['ID']['output'];
  /** The image URI of a printing. */
  imageUri: Maybe<Scalars['String']['output']>;
  /** The price of the non-foil version of a printing in EUR. */
  priceEur: Maybe<Scalars['Decimal']['output']>;
  /** The price of the etched version of a printing in EUR. This does not exist in the Scryfall API, so it is approximated by multiplying the USD etched price by 0.9. */
  priceEurEtched: Maybe<Scalars['Decimal']['output']>;
  /** The price of the foil version of a printing in EUR. */
  priceEurFoil: Maybe<Scalars['Decimal']['output']>;
  /** The price of the non-foil version of a printing in USD. */
  priceUsd: Maybe<Scalars['Decimal']['output']>;
  /** The price of the etched version of a printing in USD. */
  priceUsdEtched: Maybe<Scalars['Decimal']['output']>;
  /** The price of the foil version of a printing in USD. */
  priceUsdFoil: Maybe<Scalars['Decimal']['output']>;
  /** The numeric unique identifier of a printing. */
  printingId: Maybe<Scalars['ID']['output']>;
  /** The set code of a printing. */
  set: Maybe<Scalars['String']['output']>;
  /** The name of the set of a printing. */
  setName: Maybe<Scalars['String']['output']>;
};

export type CardsQueryVariables = Exact<{
  first: InputMaybe<Scalars['Int']['input']>;
  filter: InputMaybe<CardFilter>;
  printingsFirst: InputMaybe<Scalars['Int']['input']>;
}>;


export type CardsQuery = { __typename?: 'Query', cards: { __typename?: 'QueryCardsConnection', edges: Array<{ __typename?: 'QueryCardsConnectionEdge', node: { __typename?: 'card', id: string, cardId: string | null, name: string | null, mainType: CardType | null, printings: { __typename?: 'cardPrintingsConnection', edges: Array<{ __typename?: 'cardPrintingsConnectionEdge', node: { __typename?: 'printing', id: string, printingId: string | null, set: string | null, setName: string | null, finishes: Array<Finish> | null, imageUri: string | null, backImageUri: string | null, priceUsd: any | null, priceUsdFoil: any | null, priceUsdEtched: any | null, priceEur: any | null, priceEurFoil: any | null, priceEurEtched: any | null } | null } | null> | null, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean } } | null } | null } | null> | null } | null };


export const CardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Cards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CardFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"printingsFirst"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cardId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mainType"}},{"kind":"Field","name":{"kind":"Name","value":"printings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"printingsFirst"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"printingId"}},{"kind":"Field","name":{"kind":"Name","value":"set"}},{"kind":"Field","name":{"kind":"Name","value":"setName"}},{"kind":"Field","name":{"kind":"Name","value":"finishes"}},{"kind":"Field","name":{"kind":"Name","value":"imageUri"}},{"kind":"Field","name":{"kind":"Name","value":"backImageUri"}},{"kind":"Field","name":{"kind":"Name","value":"priceUsd"}},{"kind":"Field","name":{"kind":"Name","value":"priceUsdFoil"}},{"kind":"Field","name":{"kind":"Name","value":"priceUsdEtched"}},{"kind":"Field","name":{"kind":"Name","value":"priceEur"}},{"kind":"Field","name":{"kind":"Name","value":"priceEurFoil"}},{"kind":"Field","name":{"kind":"Name","value":"priceEurEtched"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CardsQuery, CardsQueryVariables>;