import mongoose from "mongoose";
import { FieldType } from "src/@types";

const convertFieldTypeToMongoose: any = (field: FieldType) => {
  switch (field.type) {
    case "string":
      return { type: String };
    case "slug":
      return { type: String };
    case "image":
      return { type: String }; // You might want to store just the URL or a reference to a file
    case "array":
      if (field.of && field.of.length > 0) {
        // 处理数组内部的类型
        const arrayType = field.of[0];
        if (arrayType.type === "reference") {
          return [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref:
                arrayType.to.type.charAt(0).toUpperCase() +
                arrayType.to.type.slice(1),
            },
          ];
        } else {
          return [convertFieldTypeToMongoose(arrayType)];
        }
      } else {
        return [String]; // 默认返回字符串数组
      }
    case "reference":
      return {
        type: mongoose.Schema.Types.ObjectId,
        ref: field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1),
      };
    case "datetime":
      return { type: Date };
    case "date":
      return { type: Date };
    case "file":
      return { type: String };
    case "geopoint":
      return { type: String };
    case "number":
      return { type: Number };
    case "object":
      return { type: String };
    case "text":
      return { type: String };
    case "url":
      return { type: String };
    case "blockContent":
      return { type: String };
    case "boolean":
      return { type: Boolean };
    default:
      return { type: String }; // Default to String if type is not explicitly handled
  }
};

export const generateMongooseModels = (schema: any, schemaTypes: any) => {
  const models: any = {};

  schemaTypes.forEach((type: any) => {
    if (type.type === "document") {
      const fields = type.fields.reduce((acc: any, field: any) => {
        acc[field.name] = convertFieldTypeToMongoose(field);
        return acc;
      }, {});

      fields["_type"] = {
        type: String,
      };

      fields["_createdAt"] = {
        type: Date,
      };

      fields["_updatedAt"] = {
        type: Date,
      };

      fields["_rev"] = {
        type: String,
      };
      console.log("MongooseModels", type.name, fields);
      const schemaDefinition = new mongoose.Schema(fields);
      models[type.name.charAt(0).toUpperCase() + type.name.slice(1)] =
        mongoose.model(
          type.name.charAt(0).toUpperCase() + type.name.slice(1),
          schemaDefinition
        );
    }
  });

  return models;
};
