import { generateMongooseModels } from "./db.mjs";
const convertGraphqlFieldType = (field) => {
  switch (field.type) {
    case "string":
      return "String";
    case "slug":
      return "String";
    case "image":
      return "String";
    case "array":
      return `[${field.of.map((ofType) => convertGraphqlFieldType(ofType)).join(", ")}]`;
    case "reference":
      return `${field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1)}`;
    default:
      return "String"; // Default to String if type is not explicitly handled
  }
};

const convertGraphqlInputFieldType = (field) => {
  switch (field.type) {
    case "string":
      return "String";
    case "slug":
      return "String";
    case "image":
      return "String";
    case "array":
      return `[${field.of.map((ofType) => convertGraphqlInputFieldType(ofType)).join(", ")}]`;
    case "reference":
      return "ID";
    default:
      return "String"; // Default to String if type is not explicitly handled
  }
};

export const generateTypeDefsAndResolvers = (schema, schemaTypes) => {
  const models = generateMongooseModels(schema, schemaTypes);
  console.log("models", models);

  const typeDefs = [];
  const resolvers = { Query: {}, Mutation: {} };

  const typeNames = schema.getTypeNames();

  // const hasImageType = typeNames.some((type) => type === "image");
  // if (hasImageType) {
  //   typeDefs.push(`
  //       type Image {
  //         asset: String
  //         hotspot: Boolean
  //       }
  //     `);
  // }

  const queryFields = [];
  const mutaionFields = [];

  schemaTypes.forEach((type) => {
    if (type.type === "document") {
      const fields = type.fields
        .map((field) => {
          const fieldType = convertGraphqlFieldType(field);
          return `${field.name}: ${fieldType}`;
        })
        .join("\n    ");

      const inputFields = type.fields
        .map((field) => {
          if (field.type !== "array") {
            const fieldType = convertGraphqlInputFieldType(field);
            return `${field.name}: ${fieldType}`;
          }
        })
        .join("\n    ");

      const references = [];
      type.fields.forEach((field) => {
        if (field.type == "reference") {
          references.push({
            path: field.to.type,
          });
        }
        if (
          field.type === "array" &&
          field.of.length > 0 &&
          field.of.some((o) => o.type === "reference")
        ) {
          field.of.forEach((o) => {
            if (o.type === "reference") {
              references.push({
                path: `${o.to.type}s`,
                populate: {
                  path: type.name,
                  model: type.name.charAt(0).toUpperCase() + type.name.slice(1),
                },
              });
            }
          });
        }
      });

      typeDefs.push(`
            input ${type.name.charAt(0).toUpperCase() + type.name.slice(1) + "Input"} {
              ${inputFields}
            }

            type ${type.name.charAt(0).toUpperCase() + type.name.slice(1)} {
              id: ID
              ${fields}
            }
          `);

      // query
      // list
      const listName = `${type.name}s`;
      queryFields.push(
        `${listName}(offset: Int, limit: Int): [${type.name.charAt(0).toUpperCase() + type.name.slice(1)}]`
      );

      resolvers.Query[`${listName}`] = async (
        _,
        { offset, limit },
        context
      ) => {
        if (context.nthIndex !== undefined) {
          limit = 1;
          offset = context.nthIndex;
        }
        const Model =
          models?.[type.name.charAt(0).toUpperCase() + type.name.slice(1)];
        let query = Model.find();
        references.forEach((ref) => {
          query = query.populate(ref);
        });
        if (!!offset) {
          query.skip(offset);
        }
        if (!!limit) {
          query.limit(limit);
        }

        return query || [];
      };

      // find type by id
      const findName = `find_${type.name}_by_id`;
      queryFields.push(
        `${findName}(id: ID): ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}`
      );
      resolvers.Query[`${findName}`] = async (_parent, { id }) => {
        const Model =
          models?.[type.name.charAt(0).toUpperCase() + type.name.slice(1)];

        let query = Model.findById(id);
        references.forEach((ref) => {
          query = query.populate(ref);
        });

        const res = await query;
        console.log("res", res);
        return res;
      };

      // mutation
      // create
      const createName = `create_${type.name}`;
      mutaionFields.push(
        `${createName}(input: ${type.name.charAt(0).toUpperCase() + type.name.slice(1) + "Input"}): ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}`
      );
      resolvers.Mutation[createName] = async (_parent, { input }) => {
        const Model =
          models?.[type.name.charAt(0).toUpperCase() + type.name.slice(1)];
        const model = new Model({
          ...input,
        });
        await model.save();
        // post 关联 author, 需要更新
        let typeReference = type.fields.find(
          (field) => field.type === "reference"
        );
        if (!!typeReference) {
          const to = typeReference.to.type;
          const referenceModel =
            models?.[to.charAt(0).toUpperCase() + to.slice(1)];
          const id = input?.[to];
          const modelId = model._id.toString();
          await referenceModel.findByIdAndUpdate(
            id,
            {
              $push: { [`${type.name.toLowerCase()}s`]: modelId },
            },
            { new: true }
          );
        }

        let query = model;
        references.forEach((ref) => {
          query = query.populate(ref);
        });

        return query;
      };
    }
  });

  typeDefs.push(`
      type Query {
        ${queryFields.join("\n  ")}
      }

      type Mutation {
        ${mutaionFields.join("\n  ")}
      }
    `);

  console.log("resolvers", resolvers);

  return { typeDefs: typeDefs.join("\n"), resolvers };
};
