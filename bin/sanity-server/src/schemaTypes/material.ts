import { SanityDocumentType } from "src/@types";

export const Material: SanityDocumentType = {
  name: "material",
  title: "Material",
  type: "document",
  fields: [
    {
      name: "asset",
      title: "Asset",
      type: "reference",
      to: { type: "asset" },
    },
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "user",
      title: "User",
      type: "reference",
      to: { type: "user" },
    },
    {
      name: "extension",
      title: "Extension",
      type: "string",
    },
    {
      name: "source",
      title: "Source",
      type: "number",
    },
    {
      name: "tag",
      title: "Tag",
      type: "string",
    },
    {
      name: "description",
      title: "Description",
      type: "string",
    },
    {
      name: "score",
      title: "Score",
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
    {
      name: "material_type",
      title: "material_type",
      type: "number",
    },
    {
      name: "link",
      title: "Link",
      type: "string",
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: { type: "tag" } }],
    },
    {
      name: "folders",
      title: "Folders",
      type: "array",
      of: [{ type: "reference", to: { type: "folder" } }],
    },
  ],
};
