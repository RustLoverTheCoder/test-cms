import { DocumentInterfaceFields } from "../interface/document";
import { generateMutations } from "./mutation";
import { schema as Schema, schemaTypes as SchemaTypes } from "../schemaTypes";
import { FieldType } from "src/@types";

const convertGraphqlFieldType: any = (field: FieldType) => {
  switch (field.type) {
    case "string":
      return "String";
    case "slug":
      return "Slug";
    case "image":
      return `Image @requiresScopes(scopes: [["read:image"]])`;
    case "array":
      return `[${field.of.map((ofType: any) => convertGraphqlFieldType(ofType)).join(", ")}]`;
    case "reference":
      return `${field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1)}`;
    case "datetime":
      return "DateTime";
    case "date":
      return "Date";
    case "file":
      return "File"; // todo file
    case "geopoint":
      return "Geopoint";
    case "number":
      return "Float";
    // case "object":
    //   return "String"; // todo object
    case "text":
      return "String";
    case "url":
      return "String";
    case "blockContent":
      return "JSON";
    case "boolean":
      return "Boolean";
    default:
      // 给 object 使用
      return field.type.charAt(0).toUpperCase() + field.type.slice(1);
  }
};

// array blockContent 没有
const convertGraphqlFilterType = (field: FieldType) => {
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
      return "FileFilter";
    case "geopoint":
      return "GeopointFilter";
    case "number":
      return "FloatFilter";
    // case "object":
    //   return "StringFilter"; // todo objectFilter
    case "text":
      return "StringFilter";
    case "url":
      return "StringFilter";
    case "blockContent":
      return "JSON";
    default:
      return `${field.type.charAt(0).toUpperCase() + field.type.slice(1)}Filter`;
  }
};

// array reference blockContent 没有
const convertGraphqlSortOrderType = (field: FieldType) => {
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
      return "FileSorting";
    case "geopoint":
      return "GeopointSorting";
    case "number":
      return "SortOrder";
    // case "object":
    //   return "SortOrder"; // todo ObjectSorting
    case "text":
      return "SortOrder";
    case "url":
      return "SortOrder";
    default:
      return `${field.type.charAt(0).toUpperCase() + field.type.slice(1)}Sorting`;
  }
};

export const generateTypeDefsAndResolvers = (
  schemaTypes: typeof SchemaTypes,
  models: any
) => {
  // const models = generateMongooseModels(schemaTypes);
  console.log("models", models);

  const typeDefs: any = [];
  const resolvers: any = { Query: {}, Mutation: {} };

  const queryFields: any = [];
  const mutaionFields: any = [];

  schemaTypes.forEach((type: any) => {
    if (type.type === "document") {
      const fields = type.fields
        .map((field: any) => {
          const fieldType = convertGraphqlFieldType(field);
          let key = field.name;
          if (field.type === "array") {
            key = `${field.name}(offset: Int, limit: Int)`;
          }
          return `${key}: ${fieldType}`;
        })
        .join("\n    ");

      const filterFields = type.fields
        .map((field: any) => {
          if (field.type !== "array" && field.type !== "blockContent") {
            const fieldType = convertGraphqlFilterType(field);
            return `${field.name}: ${fieldType}`;
          }
        })
        .join("\n    ");

      const sortOrderFields = type.fields
        .map((field: any) => {
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

      const {
        typeDefs: MutationTypeDefs,
        mutaionField,
        resolvers: mutationResolvers,
      } = generateMutations(type.name, type.fields, models);

      // 测试 @authenticated
      typeDefs.push(`
        ${MutationTypeDefs}

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
          ## ${type.name.charAt(0).toUpperCase() + type.name.slice(1) === "User" ? "" : "userPermissions: [UserPermission]"}
        }
      `);

      // query
      // list
      const listName = `all${type.name.charAt(0).toUpperCase() + type.name.slice(1)}`;
      queryFields.push(
        `${listName}(where: ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}Filter,sort: [${type.name.charAt(0).toUpperCase() + type.name.slice(1)}Sorting!],offset: Int, limit: Int): [${type.name.charAt(0).toUpperCase() + type.name.slice(1)}!]`
      );

      resolvers.Query[`${listName}`] = async (
        _: any,
        {
          where,
          sort,
          offset,
          limit,
        }: { where?: any; sort?: any[]; offset?: number; limit?: number },
        context: any
      ) => {
        console.log(`${listName}  where->>`, where);
        console.log(`${listName}  sort->>`, sort);

        const userId = context?.user?._id;
        const role = context?.user?.role;
        console.log("userId", userId, "role", role);

        const Model =
          models?.[type.name.charAt(0).toUpperCase() + type.name.slice(1)];
        // todo user 和 user permission 不需要加这个
        let query = Model.find(
          role === "admin"
            ? {}
            : {
                "userPermissions.user": userId,
                "userPermissions.canRead": true,
              }
        );

        // 我们没有草稿
        if (!!where?._?.is_draft) {
          return [];
        }

        // filter
        if (!!where) {
          const mongooseFilter = convertToMongooseFilter(where);
          console.log("mongooseFilter", mongooseFilter);
          query = Model.find(mongooseFilter).populate("assetObject");

          if (!!where?._?.references) {
            const typeReference = type.fields.find(
              (field: any) => field.type === "reference"
            );
            if (!!typeReference) {
              const to = typeReference.to.type;
              query = query.where(to).equals(where._.references);
            }
          }
        }
        // sort
        if (!!sort) {
          const mongooseSort = {};
          sort.forEach((s) => {
            const item = flattenSort(s);
            Object.assign(mongooseSort, item);
          });
          console.log("mongooseSort", mongooseSort);
          query.sort(mongooseSort);
        }

        if (!!offset) {
          query.skip(offset);
        }
        if (!!limit) {
          query.limit(limit);
        }

        const res = await query;
        return res || [];
      };

      // find type by id
      const findName = `${type.name.charAt(0).toUpperCase() + type.name.slice(1)}`;
      queryFields.push(
        `${findName}(id: ID!): ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}`
      );
      resolvers.Query[`${findName}`] = async (
        _parent: any,
        input: any,
        context: any
      ) => {
        const userId = context?.user?._id;
        const role = context?.user?.role;

        const Model =
          models?.[type.name.charAt(0).toUpperCase() + type.name.slice(1)];

        // todo user 和 user permission 不需要加这个
        let query = Model.findById(
          role === "admin"
            ? {}
            : {
                _id: input.id,
                "userPermissions.user": userId,
                "userPermissions.canRead": true,
              }
        );

        const item = await query;
        if (!item) {
          throw new Error("Unauthorized");
        }
        return item;
      };

      // mutation
      // create
      mutaionFields.push(`${mutaionField}`);
      resolvers.Mutation = Object.assign(
        resolvers.Mutation,
        mutationResolvers.Mutation
      );

      // 新增字段解析 比如 Author 要实现 对 posts 的解析
      resolvers[type.name.charAt(0).toUpperCase() + type.name.slice(1)] = {};
      type.fields.forEach((field: any) => {
        // 引用
        if (field.type == "reference") {
          resolvers[type.name.charAt(0).toUpperCase() + type.name.slice(1)][
            field.to.type
          ] = async (parent: any, _input: any) => {
            const Model =
              models?.[
                field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1)
              ];
            return await Model.findById(parent[field.to.type]);
          };
        }
        // 数组引用
        if (
          field.type === "array" &&
          field.of.length > 0 &&
          field.of.some((o: any) => o.type === "reference") &&
          field.name !== "userPermissions" // 真的权限
        ) {
          resolvers[type.name.charAt(0).toUpperCase() + type.name.slice(1)][
            field.of[0].to.type + "s"
          ] = async (parent: any, { offset, limit }: any, context: any) => {
            console.log(
              "array",
              type.name.charAt(0).toUpperCase() + type.name.slice(1),
              field.of[0].to.type + "s",
              parent
            );
            console.log("array context", context);
            const Model =
              models?.[
                field.of[0].to.type.charAt(0).toUpperCase() +
                  field.of[0].to.type.slice(1)
              ];

            console.log("Model", Model, type.name);

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
            const res = await query;
            return res || [];
          };
        }
        // object
        if (
          field.type !== "string" &&
          field.type !== "slug" &&
          field.type !== "image" &&
          field.type !== "array" &&
          field.type !== "reference" &&
          field.type !== "datetime" &&
          field.type !== "date" &&
          field.type !== "file" &&
          field.type !== "geopoint" &&
          field.type !== "number" &&
          field.type !== "object" &&
          field.type !== "text" &&
          field.type !== "url" &&
          field.type !== "blockContent" &&
          field.type !== "boolean"
        ) {
          resolvers[type.name.charAt(0).toUpperCase() + type.name.slice(1)][
            field.name
          ] = async (parent: any, _input: any) => {
            const Model =
              models?.[
                field.type.charAt(0).toUpperCase() + field.type.slice(1)
              ];
            return await Model.findById(parent[field.name]);
          };
        }
      });

      // console.log("resolvers", resolvers);
    }
    // object
    if (type.type === "object") {
      const fields = type.fields
        .map((field: any) => {
          const fieldType = convertGraphqlFieldType(field);
          let key = field.name;
          if (field.type === "array") {
            key = `${field.name}(offset: Int, limit: Int)`;
          }
          return `${key}: ${fieldType}`;
        })
        .join("\n    ");

      const filterFields = type.fields
        .map((field: any) => {
          if (field.type !== "array" && field.type !== "blockContent") {
            const fieldType = convertGraphqlFilterType(field);
            return `${field.name}: ${fieldType}`;
          }
        })
        .join("\n    ");

      const sortOrderFields = type.fields
        .map((field: any) => {
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

      const {
        typeDefs: MutationTypeDefs,
        mutaionField,
        resolvers: mutationResolvers,
      } = generateMutations(type.name, type.fields, models);

      typeDefs.push(`
        input ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}Filter {
          ${filterFields}
        }

        input ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}Sorting {
          ${sortOrderFields}
        }

        input ${type.name.charAt(0).toUpperCase() + type.name.slice(1)}Input {
          ${fields}
        }
        
        ${MutationTypeDefs}

        type ${type.name.charAt(0).toUpperCase() + type.name.slice(1)} {
          ${fields}
        }
          `);

      mutaionFields.push(`${mutaionField}`);
      resolvers.Mutation = Object.assign(
        resolvers.Mutation,
        mutationResolvers.Mutation
      );
    }
  });

  console.log("resolvers", resolvers);

  return {
    typeDefs: typeDefs.join("\n"),
    resolvers,
    queryFields,
    mutaionFields,
  };
};

// sort 转 mongoose sort
function flattenSort(criteria: any, prefix = "") {
  let flattened: any = {};
  for (let key in criteria) {
    if (criteria.hasOwnProperty(key)) {
      const value = criteria[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && !Array.isArray(value)) {
        Object.assign(flattened, flattenSort(value, newKey));
      } else {
        flattened[newKey] = value.toLowerCase();
      }
    }
  }
  return flattened;
}

function convertToMongooseFilter(criteria: any) {
  const mongooseFilter: any = {};

  for (const key in criteria) {
    if (criteria.hasOwnProperty(key)) {
      const fieldCriteria = criteria[key];
      const fieldFilter: any = {};

      for (const op in fieldCriteria) {
        if (fieldCriteria.hasOwnProperty(op) && fieldCriteria[op] !== null) {
          switch (op) {
            case "eq":
              fieldFilter["$eq"] = fieldCriteria[op];
              break;
            case "neq":
              fieldFilter["$ne"] = fieldCriteria[op];
              break;
            case "matches":
              fieldFilter["$regex"] = fieldCriteria[op];
              break;
            case "in":
              fieldFilter["$in"] = fieldCriteria[op];
              break;
            case "nin":
              fieldFilter["$nin"] = fieldCriteria[op];
              break;
            case "gt":
              fieldFilter["$gt"] = fieldCriteria[op];
              break;
            case "gte":
              fieldFilter["$gte"] = fieldCriteria[op];
              break;
            case "lt":
              fieldFilter["$lt"] = fieldCriteria[op];
              break;
            case "lte":
              fieldFilter["$lte"] = fieldCriteria[op];
              break;
            case "is_defined":
              if (fieldCriteria[op]) {
                fieldFilter["$exists"] = true;
              } else {
                fieldFilter["$exists"] = false;
              }
              break;
            default:
              break;
          }
        }
      }

      if (Object.keys(fieldFilter).length > 0) {
        mongooseFilter[key] = fieldFilter;
      }
    }
  }

  return mongooseFilter;
}

// function convertToMongooseFilter(criteria) {
//   const mongooseFilter = {};

//   function processCriteria(criteria, parentKey = "") {
//     for (const key in criteria) {
//       if (criteria.hasOwnProperty(key)) {
//         const fieldCriteria = criteria[key];
//         if (
//           typeof fieldCriteria === "object" &&
//           !Array.isArray(fieldCriteria) &&
//           fieldCriteria !== null &&
//           !fieldCriteria.hasOwnProperty("eq") &&
//           !fieldCriteria.hasOwnProperty("neq")
//         ) {
//           console.log(
//             "1",
//             fieldCriteria,
//             parentKey ? `${parentKey}.${key}` : key
//           );
//           processCriteria(
//             fieldCriteria,
//             parentKey ? `${parentKey}.${key}` : key
//           );
//         } else {
//           const fieldFilter = {};
//           for (const op in criteria) {
//             if (criteria.hasOwnProperty(op) && criteria[op] !== null) {
//               switch (op) {
//                 case "eq":
//                   fieldFilter["$eq"] = criteria[op];
//                   break;
//                 case "neq":
//                   fieldFilter["$ne"] = criteria[op];
//                   break;
//                 case "matches":
//                   fieldFilter["$regex"] = criteria[op];
//                   break;
//                 case "in":
//                   fieldFilter["$in"] = criteria[op];
//                   break;
//                 case "nin":
//                   fieldFilter["$nin"] = criteria[op];
//                   break;
//                 case "gt":
//                   fieldFilter["$gt"] = criteria[op];
//                   break;
//                 case "gte":
//                   fieldFilter["$gte"] = criteria[op];
//                   break;
//                 case "lt":
//                   fieldFilter["$lt"] = criteria[op];
//                   break;
//                 case "lte":
//                   fieldFilter["$lte"] = criteria[op];
//                   break;
//                 case "is_defined":
//                   fieldFilter["$exists"] = criteria[op];
//                   break;
//                 default:
//                   break;
//               }
//             }
//           }

//           if (Object.keys(fieldFilter).length > 0) {
//             mongooseFilter[parentKey ? `${parentKey}.${key}` : key] =
//               fieldFilter;
//           }
//         }
//       }
//     }
//   }

//   processCriteria(criteria);

//   return mongooseFilter;
// }
