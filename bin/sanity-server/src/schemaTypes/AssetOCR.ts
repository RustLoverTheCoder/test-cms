import { SanityDocumentType } from "src/@types";

export const AssetOCR: SanityDocumentType = {
  name: "assetOCR",
  title: "AssetOCR",
  type: "document",
  fields: [
    {
      name: "asset",
      title: "Asset",
      type: "reference",
      to: { type: "asset" },
    },
    {
      name: "content",
      title: "content",
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
      name: "process_status",
      title: "process_status",
      type: "number",
    },
    {
      name: "response",
      title: "Response",
      type: "string",
    },
  ],
};
