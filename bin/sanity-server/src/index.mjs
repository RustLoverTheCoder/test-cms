// import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import gql from "graphql-tag";
// scalar
import GraphQLJSON from "graphql-type-json";
import GraphQLDateTime from "graphql-type-datetime";
import GraphQLDate from "../src/scalars/date.mjs";

import mongoose from "mongoose";

import { schema, schemaTypes } from "./schemaTypes/index.mjs";
import { generateTypeDefsAndResolvers } from "./generate/graphql.mjs";
import { generateFileTypeDefsAndResolvers } from "./generate/file.mjs";
import { generateImageTypeDefsAndResolvers } from "./generate/image.mjs";

import { ExtendDirective } from "./directives/directive.mjs";

import { DocumentInterface } from "./interface/document.mjs";

import { BlockOrImageUnion } from "./union/BlockOrImage.mjs";
import { GeopointType } from "./types/geopoint.mjs";

import { SortOrderEnum } from "./enum/sortOrder.mjs";

import { FilterInput } from "./filter/filter.mjs";
import { SortOrderFilter } from "./filter/sortOrder.mjs";

import { SearchExtend } from "./extend/search.mjs";

const MONGODB_URI = "mongodb://admin:admin@localhost:27017";

// 定义 directive
const { DirectiveTypeDefs, DirectiveTransformer } = ExtendDirective();

/*
  根据 schema 生成 typeDefs 和 resolvers
*/

const {
  typeDefs: fileTypeDefs,
  resolvers: fileResolvers,
  queryFields: fileQueryFields,
  mutaionFields: fileMutaionFields,
} = generateFileTypeDefsAndResolvers();

const {
  typeDefs: imageTypeDefs,
  resolvers: imageResolvers,
  queryFields: imageQueryFields,
  mutaionFields: imageMutaionFields,
} = generateImageTypeDefsAndResolvers();

const { typeDefs, resolvers, queryFields, mutaionFields } =
  generateTypeDefsAndResolvers(schema, schemaTypes);

// extend
const { SearchTypeDefs, SearchQuery, SearchQueryFields } = SearchExtend();

const federationTypeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.8"
      import: ["@key", "@shareable", "@authenticated", "@requiresScopes"]
    )

  scalar JSON
  scalar DateTime
  scalar Date

  type Slug {
    _key: String
    _type: String
    current: String
    source: String
  }

  ${DocumentInterface}

  ${SortOrderEnum}

  ${BlockOrImageUnion}
  ${GeopointType}

  ${FilterInput}
  ${SortOrderFilter}

  ${fileTypeDefs}
  ${imageTypeDefs}

  ${[DirectiveTypeDefs, typeDefs, SearchTypeDefs].join("\n    ")}
        type Query {
        ${fileQueryFields.join("\n  ")}
        ${imageQueryFields.join("\n  ")}
        ${queryFields.join("\n  ")}
        ${SearchQueryFields.join("\n  ")}
      }

      type Mutation {
        ${fileMutaionFields.join("\n  ")}
        ${imageMutaionFields.join("\n  ")}
        ${mutaionFields.join("\n  ")}
      }
`;

let graphqlSchema = buildSubgraphSchema({
  typeDefs: federationTypeDefs,
  resolvers: {
    Query: {
      ...fileResolvers.Query,
      ...imageResolvers.Query,
      ...resolvers.Query,
      ...SearchQuery,
    },
    Mutation: {
      ...fileResolvers.Mutation,
      ...imageResolvers.Mutation,
      ...resolvers.Mutation,
    },
    ...fileResolvers,
    ...imageResolvers,
    ...resolvers,
    JSON: GraphQLJSON,
    DateTime: GraphQLDateTime,
    Date: GraphQLDate,
  },
});

graphqlSchema = DirectiveTransformer(graphqlSchema);

const server = new ApolloServer({
  schema: graphqlSchema,
  context: ({ req }) => ({ req }),
});

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Connected Successfully");
    return startStandaloneServer(server, {
      listen: { port: 4006 },
    });
  })
  .then((res) => {
    console.log(`Server is running on port ${res.url}`);
  });
