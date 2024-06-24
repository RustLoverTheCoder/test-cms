import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { schema, schemaTypes } from "./schemaTypes/index.mjs";

/*
  根据 schema 生成 typeDefs 和 resolvers
*/

const convertFieldType = (field) => {
  switch (field.type) {
    case "string":
      return "String";
    case "slug":
      return "String";
    case "image":
      return "Image";
    case "array":
      return `[${field.of.map((ofType) => convertFieldType(ofType)).join(", ")}]`;
    case "reference":
      return `${field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1)}`;
    default:
      return "String"; // Default to String if type is not explicitly handled
  }
};

const generateTypeDefsAndResolvers = (schema) => {
  const typeDefs = [];
  const resolvers = { Query: {} };

  const typeNames = schema.getTypeNames();

  console.log("typeNames", typeNames);

  const hasImageType = typeNames.some((type) => type === "image");
  if (hasImageType) {
    typeDefs.push(`
      type Image {
        asset: String
        hotspot: Boolean
      }
    `);
  }

  const queryFields = [];

  schemaTypes.forEach((type) => {
    if (type.type === "document") {
      const fields = type.fields
        .map((field) => {
          const fieldType = convertFieldType(field);
          return `${field.name}: ${fieldType}`;
        })
        .join("\n    ");

      typeDefs.push(`
          type ${type.name.charAt(0).toUpperCase() + type.name.slice(1)} {
            ${fields}
          }
        `);

      queryFields.push(
        `${type.name}: [${type.name.charAt(0).toUpperCase() + type.name.slice(1)}]`
      );

      resolvers.Query[type.name] = async () => {
        // This is a mock resolver, replace with actual data fetching logic
        return [];
      };
    }
  });

  typeDefs.push(`
    type Query {
      ${queryFields.join("\n  ")}
    }
  `);

  return { typeDefs: typeDefs.join("\n"), resolvers };
};

const { typeDefs, resolvers } = generateTypeDefsAndResolvers(schema);
console.log("typeDefs", typeDefs);
console.log("resolvers", resolvers);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4006 },
});

console.log(`🚀  Sanity Server ready at: ${url}`);
