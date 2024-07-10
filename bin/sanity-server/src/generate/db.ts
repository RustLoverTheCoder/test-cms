import mongoose from "mongoose";
import { FieldType, MongooseField } from "src/@types";
import { schemaTypes as SchemaTypes } from "../schemaTypes";

function convertFieldTypeToMongoose(field: FieldType): MongooseField;
function convertFieldTypeToMongoose(field: FieldType) {
  switch (field.type) {
    case "string":
      return { type: mongoose.Schema.Types.String };
    case "slug":
      return { type: mongoose.Schema.Types.String };
    case "image":
      return {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      };
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
          return [
            convertFieldTypeToMongoose({ ...arrayType, name: "", title: "" }),
          ];
        }
      } else {
        return [{ type: mongoose.Schema.Types.String }];
      }
    case "reference":
      return {
        type: mongoose.Schema.Types.ObjectId,
        ref: field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1),
      };
    case "datetime":
      return { type: mongoose.Schema.Types.Date };
    case "date":
      return { type: mongoose.Schema.Types.Date };
    case "file":
      return { type: mongoose.Schema.Types.String };
    case "geopoint":
      return { type: mongoose.Schema.Types.String };
    case "number":
      return { type: mongoose.Schema.Types.Number };
    // case "object":
    //   return { type: mongoose.Schema.Types.String };
    case "text":
      return { type: mongoose.Schema.Types.String };
    case "url":
      return { type: mongoose.Schema.Types.String };
    case "blockContent":
      return { type: mongoose.Schema.Types.String };
    case "boolean":
      return { type: mongoose.Schema.Types.Boolean };
    default:
      // object
      return {
        type: mongoose.Schema.Types.ObjectId,
        ref: field.type.charAt(0).toUpperCase() + field.type.slice(1),
      };
  }
}

export const generateMongooseModels = (schemaTypes: typeof SchemaTypes) => {
  // 默认有一个用户权限
  // const userPermissionSchema = new mongoose.Schema({
  //   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  //   documentType: { type: String, required: true },
  //   documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  //   canRead: { type: Boolean, default: false },
  //   canWrite: { type: Boolean, default: false },
  // });

  const models: any = {
    // UserPermissionSchema: mongoose.model(
    //   "UserPermissionSchema",
    //   userPermissionSchema
    // ),
  };
  schemaTypes.forEach((type) => {
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

      const UserPermissionSchema = new mongoose.Schema({
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        canRead: {
          type: Boolean,
        },
        canEdit: {
          type: Boolean,
        },
        canDelete: {
          type: Boolean,
        },
      });

      fields["userPermissions"] = [UserPermissionSchema];

      const schemaDefinition = new mongoose.Schema(fields);
      models[type.name.charAt(0).toUpperCase() + type.name.slice(1)] =
        mongoose.model(
          type.name.charAt(0).toUpperCase() + type.name.slice(1),
          schemaDefinition
        );
    }

    if (type.type === "object") {
      // 也要一个模型
      const fields = type.fields.reduce((acc: any, field: any) => {
        acc[field.name] = convertFieldTypeToMongoose(field);
        return acc;
      }, {});
      const schemaDefinition = new mongoose.Schema(fields);
      models[type.name.charAt(0).toUpperCase() + type.name.slice(1)] =
        mongoose.model(
          type.name.charAt(0).toUpperCase() + type.name.slice(1),
          schemaDefinition
        );
    }
  });

  console.log("models", models);

  return models;
};
