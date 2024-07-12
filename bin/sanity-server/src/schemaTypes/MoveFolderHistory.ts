import { SanityDocumentType } from "src/@types";

export const MoveFolderHistory: SanityDocumentType = {
  name: "moveFolderHistory",
  title: "MoveFolderHistory",
  type: "document",
  fields: [
    {
      name: "folder",
      title: "Folder",
      type: "reference",
      to: { type: "folder" },
    },
    {
      name: "type",
      title: "Type",
      type: "number",
    },
    {
      name: "org_id",
      title: "org_id",
      type: "string",
    },
    {
      name: "user",
      title: "User",
      type: "reference",
      to: { type: "user" },
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
  ],
};
