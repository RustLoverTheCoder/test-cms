import { generateMongooseModels } from "./db.mjs";
import { DocumentInterfaceFields } from "../interface/document.mjs";

const convertGraphqlFieldType = (field) => {
  switch (field.type) {
    case "string":
      return "String";
    case "slug":
      return "Slug";
    case "image":
      return `Image @requiresScopes(scopes: [["read:image"]])`;
    case "array":
      return `[${field.of.map((ofType) => convertGraphqlFieldType(ofType)).join(", ")}]`;
    case "reference":
      return `${field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1)}`;
    case "datetime":
      return "DateTime";
    case "date":
      return "Date";
    case "file":
      return "String"; // todo file
    case "geopoint":
      return "Geopoint";
    case "number":
      return "Float";
    case "object":
      return "String"; // todo object
    case "text":
      return "String";
    case "url":
      return "String";
    case "blockContent":
      return "JSON";
    default:
      return "String";
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

// array blockContent 没有
const convertGraphqlFilterType = (field) => {
  switch (field.type) {
    case "string":
      return "StringFilter";
    case "slug":
      return "SlugFilter";
    case "image":
      return `ImageFilter`;
    case "reference":
      return `${field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1)}Filter`;
    case "datetime":
      return "DatetimeFilter";
    case "date":
      return "DateFilter";
    case "file":
      return "StringFilter"; // todo FileFilter
    case "geopoint":
      return "GeopointFilter";
    case "number":
      return "FloatFilter";
    case "object":
      return "StringFilter"; // todo objectFilter
    case "text":
      return "StringFilter";
    case "url":
      return "StringFilter";
    case "blockContent":
      return "JSON";
    default:
      return "StringFilter";
  }
};

// array reference blockContent 没有
const convertGraphqlSortOrderType = (field) => {
  switch (field.type) {
    case "string":
      return "SortOrder";
    case "slug":
      return "SlugSorting";
    case "image":
      return `ImageSorting`;
    case "datetime":
      return "SortOrder";
    case "date":
      return "SortOrder";
    case "file":
      return "FileSorting"; // todo FileSorting
    case "geopoint":
      return "GeopointSorting";
    case "number":
      return "SortOrder";
    case "object":
      return "SortOrder"; // todo ObjectSorting
    case "text":
      return "SortOrder";
    case "url":
      return "SortOrder";
    default:
      return "SortOrder";
  }
};

export const generateTypeDefsAndResolvers = (schema, schemaTypes) => {
  const models = generateMongooseModels(schema, schemaTypes);
  console.log("models", models);

  const typeDefs = [];
  const resolvers = { Query: {}, Mutation: {} };

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

      const filterFields = type.fields
        .map((field) => {
          if (field.type !== "array" && field.type !== "blockContent") {
            const fieldType = convertGraphqlFilterType(field);
            return `${field.name}: ${fieldType}`;
          }
        })
        .join("\n    ");

      const sortOrderFields = type.fields
        .map((field) => {
          if (
            field.type !== "array" &&
            field.type !== "reference" &&
            field.type !== "blockContent"
          ) {
            const fieldType = convertGraphqlSortOrderType(field);
            return `${field.name}: ${fieldType}`;
          }
        })
        .join("\n    ");

      // 测试 @authenticated
      typeDefs.push(`
        input ${type.name.charAt(0).toUpperCase() + type.name.slice(1) + "Input"} {
          ${inputFields}
        }

        input ${type.name.charAt(0).toUpperCase() + type.name.slice(1) + "Filter"} {
          """Apply filters on document level"""
          _: Sanity_DocumentFilter
          _id: IDFilter
          _type: StringFilter
          _createdAt: DatetimeFilter
          _updatedAt: DatetimeFilter
          _rev: StringFilter
          _key: StringFilter
          ${filterFields}
        }

        input ${type.name.charAt(0).toUpperCase() + type.name.slice(1) + "Sorting"} {
          _id: SortOrder
          _type: SortOrder
          _createdAt: SortOrder
          _updatedAt: SortOrder
          _rev: SortOrder
          _key: SortOrder
          ${sortOrderFields}
        }

        type ${type.name.charAt(0).toUpperCase() + type.name.slice(1)} implements Document  @authenticated @key(fields: "_id") {
          ${DocumentInterfaceFields}
          ${fields}
        }
      `);

      // query
      // list
      const listName = `all${type.name.charAt(0).toUpperCase() + type.name.slice(1)}`;
      queryFields.push(
        `${listName}(where: ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}Filter,sort: [${type.name.charAt(0).toUpperCase() + type.name.slice(1)}Sorting!],offset: Int, limit: Int): [${type.name.charAt(0).toUpperCase() + type.name.slice(1)}!]!`
      );

      resolvers.Query[`${listName}`] = async (
        _,
        { where, sort, offset, limit },
        _context
      ) => {
        console.log("where", where);
        console.log("sort", sort);
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
      const findName = `${type.name.charAt(0).toUpperCase() + type.name.slice(1)}`;
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
          _type: type.name,
          _createdAt: new Date(),
          _updatedAt: new Date(),
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
    // object
    if (type.type === "object") {
    }
  });

  // typeDefs.push(`
  //     type Query {
  //       ${queryFields.join("\n  ")}
  //     }

  //     type Mutation {
  //       ${mutaionFields.join("\n  ")}
  //     }
  //   `);

  // console.log("resolvers", resolvers);

  return {
    typeDefs: typeDefs.join("\n"),
    resolvers,
    queryFields,
    mutaionFields,
  };
};
