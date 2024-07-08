import mongoose from "mongoose";

export type SchemaType =
  | "string"
  | "slug"
  | "image"
  | "datetime"
  | "date"
  | "geopoint"
  | "number"
  | "object"
  | "text"
  | "url"
  | "blockContent"
  | "boolean";

type ArrayOfType =
  | {
      type: SchemaType;
    }
  | {
      type: "reference";
      to: {
        type: String;
      };
    };

export type FieldType =
  | {
      name: String;
      title: String;
      type: SchemaType;
    }
  | {
      name: String;
      title: String;
      type: "reference";
      to: {
        type: String;
      };
    }
  | {
      name: String;
      title: String;
      type: "array";
      of: [ArrayOfType];
    }
  | {
      name: String;
      title: String;
      type: "file";
      fields: [FieldType];
    };

export type SanityDocumentType = {
  name: String;
  title: String;
  type: "document";
  fields: FieldType[];
};

export type MongooseField =
  | { type: typeof mongoose.Schema.Types.String }
  | { type: typeof mongoose.Schema.Types.ObjectId; ref: string }
  | { type: typeof mongoose.Schema.Types.Date }
  | { type: typeof mongoose.Schema.Types.Number }
  | { type: typeof mongoose.Schema.Types.Boolean }
  | MongooseField[]
  | {};
