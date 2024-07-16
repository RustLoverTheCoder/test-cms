// import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import gql from "graphql-tag";
// scalar
import GraphQLJSON from "graphql-type-json";

// jwt
import jwt from "jsonwebtoken";

// @ts-ignore
import GraphQLDateTime from "graphql-type-datetime";
import GraphQLDate from "./scalars/date";

import mongoose from "mongoose";

import { schema, schemaTypes } from "./schemaTypes/index";
import { generateTypeDefsAndResolvers } from "./generate/graphql";
import { generateFileTypeDefsAndResolvers } from "./generate/file";
import { generateImageTypeDefsAndResolvers } from "./generate/image";

import { ExtendDirective } from "./directives/directive";

import { DocumentInterface } from "./interface/document";

import { BlockOrImageUnion } from "./union/BlockOrImage";
import { GeopointType } from "./types/geopoint";

import { SortOrderEnum } from "./enum/sortOrder";

import { FilterInput } from "./filter/filter";
import { SortOrderFilter } from "./filter/sortOrder";

import { SearchExtend } from "./extend/search";
import { generateMongooseModels } from "./generate/db";
import { getUser } from "./utils/getUser";

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

// 生成mongo model
const models = generateMongooseModels(schemaTypes);

const { typeDefs, resolvers, queryFields, mutaionFields } =
  generateTypeDefsAndResolvers(schemaTypes, models);

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

  type UserPermission {
    user: User
    canRead: Boolean
    canEdit: Boolean
    canDelete: Boolean
  }

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
});

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Connected Successfully");
    // 添加admin
    const UserModel = models.User;
    const user = await UserModel.findById("6694f3885ec2b15395cf8246");
    if (!user) {
      const admin = new UserModel({
        _id: "6694f3885ec2b15395cf8246",
        name: "admin",
        role: "admin",
      });
      await admin.save();
    }

    return startStandaloneServer(server, {
      listen: { port: 4006 },
      context: async ({ req, res }: any) => {
        // Get the user token from the headers.
        // const token2 = jwt.sign(
        //   { iss: "muse", user_id: "6694f3885ec2b15395cf8246" },
        //   "b7e23ec29af22b0b4e41da31e868d572"
        // );
        // console.log("token2", token2);
        // const token = req.headers.authorization.replace(/^Bearer\s+/, "") || "";
        // console.log("token", token);

        // const decoded = jwt.verify(token, "b7e23ec29af22b0b4e41da31e868d572");
        // console.log("decoded", decoded);
        // // @ts-ignore
        // const user = await getUser(decoded.user_id, models);

        return { user: { name: "xxx", role: "admin" } };
      },
    });
  })
  .then((res) => {
    console.log(`Server is running on port ${res.url}`);
  });
