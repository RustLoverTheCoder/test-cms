import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import mongoose from "mongoose";

import { schema, schemaTypes } from "./schemaTypes/index.mjs";
import { generateTypeDefsAndResolvers } from "./generate/graphql.mjs";

import { ExtendDirective } from "./directives/transform.mjs";

import { SearchExtend } from "./extend/search.mjs";

const MONGODB_URI = "mongodb://admin:admin@localhost:27017";

// 定义 directive
const { DirectiveTypeDefs, DirectiveTransformer } = ExtendDirective();

/*
  根据 schema 生成 typeDefs 和 resolvers
*/

const { typeDefs, resolvers } = generateTypeDefsAndResolvers(
  schema,
  schemaTypes
);

// extend
const { SearchTypeDefs, SearchQuery } = SearchExtend();

let graphqlSchema = makeExecutableSchema({
  typeDefs: [DirectiveTypeDefs, typeDefs, SearchTypeDefs],
  resolvers: {
    Query: {
      ...resolvers.Query,
      ...SearchQuery,
    },
    Mutation: {
      ...resolvers.Mutation,
    },
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
