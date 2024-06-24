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

export const generateTypeDefsAndResolvers = (schema, schemaTypes) => {
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
