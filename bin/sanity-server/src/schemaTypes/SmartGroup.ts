import { SanityDocumentType } from "src/@types";

export const SmartGroup: SanityDocumentType = {
  name: "smartGroup",
  title: "SmartGroup",
  type: "document",
  fields: [
    {
      name: "folder",
      title: "Folder",
      type: "array",
      of: [{ type: "reference", to: { type: "folder" } }],
    },
    {
      name: "user",
      title: "User",
      type: "reference",
      to: { type: "user" },
    },
    {
      name: "logic_not",
      title: "logic_not",
      type: "number",
    },
    {
      name: "all_and",
      title: "all_and",
      type: "number",
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
