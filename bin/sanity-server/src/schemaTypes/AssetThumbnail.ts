import { SanityDocumentType } from "src/@types";

export const AssetThumbnail: SanityDocumentType = {
  name: "assetThumbnail",
  title: "AssetThumbnail",
  type: "document",
  fields: [
    {
      name: "asset",
      title: "Asset",
      type: "reference",
      to: { type: "asset" },
    },
    {
      name: "pic_type",
      title: "pic_type",
      type: "number",
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
