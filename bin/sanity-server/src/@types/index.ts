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
