import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import mongoose from "mongoose";

import { schema, schemaTypes } from "./schemaTypes/index.mjs";
import { generateTypeDefsAndResolvers } from "./generate/graphql.mjs";

import { transformDirective } from "./directives/transform.mjs";

import { SearchExtend } from "./extend/search.mjs";

const MONGODB_URI = "mongodb://admin:admin@localhost:27017";

// 定义 directive
const { transformDirectiveTypeDefs, transformDirectiveTransformer } =
  transformDirective("transform");

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
  typeDefs: [transformDirectiveTypeDefs, typeDefs, SearchTypeDefs],
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

graphqlSchema = transformDirectiveTransformer(graphqlSchema);
// console.log("graphqlSchema", graphqlSchema);

/*
  根据 schema 生成 mongodb model
*/
// console.log("models", models);

// const createSampleData = async () => {
//   try {
//     const Author = models.Author;
//     const Post = models.Post;

//     const author = new Author({
//       name: "John Doe",
//       slug: "john-doe",
//       image: "https://example.com/image.jpg",
//     });

//     await author.save();

//     const post = new Post({
//       title: "Sample Post",
//       slug: "sample-post",
//       author: author._id,
//     });

//     await post.save();

//     console.log("Sample data created successfully!");
//   } catch (error) {
//     console.error("Error creating sample data:", error);
//   }
// };

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

// const { url } = await startStandaloneServer(server, {
//   listen: { port: 4006 },
// });

// console.log(`🚀  Sanity Server ready at: ${url}`);
