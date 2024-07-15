import { SanityDocumentType } from "src/@types";

export const Tag: SanityDocumentType = {
  name: "tag",
  title: "Tag",
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
      title: "name",
      type: "localizedString",
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
      name: "classified",
      title: "Classified",
      type: "number",
    },
    {
      name: "tagGroups",
      title: "tagGroups",
      type: "array",
      of: [{ type: "reference", to: { type: "tagGroup" } }],
    },
  ],
};
