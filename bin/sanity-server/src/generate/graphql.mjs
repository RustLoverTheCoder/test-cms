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
          let key = field.name;
          if (field.type === "array") {
            key = `${field.name}(offset: Int, limit: Int)`;
          }
          return `${key}: ${fieldType}`;
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
        _context
      ) => {
        const Model =
          models?.[type.name.charAt(0).toUpperCase() + type.name.slice(1)];
        let query = Model.find();
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
      resolvers.Query[`${findName}`] = async (_parent, input) => {
        const Model =
          models?.[type.name.charAt(0).toUpperCase() + type.name.slice(1)];

        let query = Model.findById(input.id);

        return query;
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

        return query;
      };

      // 新增字段解析 比如 Author 要实现 对 posts 的解析
      resolvers[type.name.charAt(0).toUpperCase() + type.name.slice(1)] = {};
      type.fields.forEach((field) => {
        if (field.type == "reference") {
          resolvers[type.name.charAt(0).toUpperCase() + type.name.slice(1)][
            field.to.type
          ] = async (parent, _input) => {
            const Model =
              models?.[
                field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1)
              ];
            return await Model.findById(parent[field.to.type]);
          };
        }
        if (
          field.type === "array" &&
          field.of.length > 0 &&
          field.of.some((o) => o.type === "reference")
        ) {
          resolvers[type.name.charAt(0).toUpperCase() + type.name.slice(1)][
            field.of[0].to.type + "s"
          ] = async (parent, { offset, limit }, context) => {
            console.log("context", context);
            const Model =
              models?.[
                field.of[0].to.type.charAt(0).toUpperCase() +
                  field.of[0].to.type.slice(1)
              ];

            let query = Model.find({ [type.name]: parent.id });

            if (Number(context.nthIndex) > -1) {
              query.limit(1).skip(Number(context.nthIndex) - 1);
            }

            if (!!offset) {
              query.skip(offset);
            }
            if (!!limit) {
              query.limit(limit);
            }

            return await query;
          };
        }
      });

      // console.log("resolvers", resolvers);
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

  // console.log("resolvers", resolvers);

  return { typeDefs: typeDefs.join("\n"), resolvers };
};
