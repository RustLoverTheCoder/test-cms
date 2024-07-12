import { SanityDocumentType } from "src/@types";

export const Asset: SanityDocumentType = {
  name: "asset",
  title: "Asset",
  type: "document",
  fields: [
    {
      name: "uni_md5",
      title: "Uni_md5",
      type: "string",
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
      name: "store_path",
      title: "store_path",
      type: "string",
    },
    {
      name: "access_url",
      title: "access_url",
      type: "string",
    },
    {
      name: "extension",
      title: "Extension",
      type: "string",
    },
    {
      name: "size",
      title: "Size",
      type: "number",
    },
    {
      name: "width",
      title: "Width",
      type: "number",
    },
    {
      name: "height",
      title: "Height",
      type: "number",
    },
    {
      name: "color",
      title: "Color",
      type: "string",
    },
    {
      name: "link",
      title: "Link",
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
      name: "colors",
      title: "Colors",
      type: "string",
    },
    {
      name: "duration",
      title: "Duration",
      type: "number",
    },
    {
      name: "hash",
      title: "Hash",
      type: "string",
    },
  ],
};
