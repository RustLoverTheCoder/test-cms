import mongoose from "mongoose";

const convertFieldTypeToMongoose = (field) => {
  switch (field.type) {
    case "string":
      return { type: String };
    case "slug":
      return { type: String, required: true };
    case "image":
      return { type: String }; // You might want to store just the URL or a reference to a file
    case "array":
      return [String]; // Simplified, you may need a more complex handling based on `of`
    case "reference":
      return {
        type: mongoose.Schema.Types.ObjectId,
        ref: field.to.type.charAt(0).toUpperCase() + field.to.type.slice(1),
      };
    default:
      return { type: String }; // Default to String if type is not explicitly handled
  }
};

export const generateMongooseModels = (schema, schemaTypes) => {
  const models = {};

  schemaTypes.forEach((type) => {
    if (type.type === "document") {
      const fields = type.fields.reduce((acc, field) => {
        acc[field.name] = convertFieldTypeToMongoose(field);
        return acc;
      }, {});
      console.log("fields", fields);
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
