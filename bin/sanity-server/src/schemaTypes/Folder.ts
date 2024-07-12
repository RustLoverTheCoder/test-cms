import { SanityDocumentType } from "src/@types";

export const Folder: SanityDocumentType = {
  name: "folder",
  title: "Folder",
  type: "document",
  fields: [
    {
      name: "parent",
      title: "parent",
      type: "reference",
      to: { type: "folder" },
    },
    {
      name: "tree_code",
      title: "tree_code",
      type: "string",
    },
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
      name: "size",
      title: "Size",
      type: "number",
    },
    {
      name: "count",
      title: "Count",
      type: "number",
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: { type: "tag" } }],
    },
    {
      name: "description",
      title: "Description",
      type: "string",
    },
    {
      name: "color",
      title: "Color",
      type: "string",
    },
    {
      name: "score",
      title: "Score",
      type: "number",
    },
    {
      name: "thumbnail_ids",
      title: "thumbnail_ids",
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
      name: "pre_id",
      title: "pre_id",
      type: "string",
    },
    {
      name: "next_id",
      title: "next_id",
      type: "string",
    },
    {
      name: "sort",
      title: "sort",
      type: "number",
    },
    {
      name: "materials",
      title: "materials",
      type: "array",
      of: [{ type: "reference", to: { type: "material" } }],
    },
  ],
};
