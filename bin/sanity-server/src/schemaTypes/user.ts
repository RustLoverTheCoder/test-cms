import { SanityDocumentType } from "src/@types";

export const User: SanityDocumentType = {
  name: "user",
  title: "User",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
  ],
};
