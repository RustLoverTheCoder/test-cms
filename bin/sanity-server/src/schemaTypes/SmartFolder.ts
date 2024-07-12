import { SanityDocumentType } from "src/@types";

export const SmartFolder: SanityDocumentType = {
  name: "smartFolder",
  title: "SmartFolder",
  type: "document",
  fields: [
    {
      name: "user",
      title: "User",
      type: "reference",
      to: { type: "user" },
    },
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "create_user",
      title: "create_user",
      type: "reference",
      to: { type: "user" },
    },
    {
      name: "update_user",
      title: "update_user",
      type: "reference",
      to: { type: "user" },
    },
    {
      name: "status",
      title: "Status",
      type: "number",
    },
    {
      name: "org_id",
      title: "org_id",
      type: "string",
    },
    {
      name: "sort",
      title: "sort",
      type: "number",
    },
  ],
};
