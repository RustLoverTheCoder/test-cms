import { SanityDocumentType } from "src/@types";

export const AssetObject: SanityDocumentType = {
  name: "assetObject",
  title: "AssetObject",
  type: "document",
  fields: [
    {
      name: "hash",
      title: "Hash",
      type: "string",
    },
    {
      name: "size",
      title: "Size",
      type: "number",
    },
    {
      name: "mimeType",
      title: "MimeType",
      type: "string",
    },
    {
      name: "mediaData",
      title: "MediaData",
      type: "reference",
      to: { type: "mediaData" },
    },
    {
      name: "filePaths",
      title: "filePaths",
      type: "array",
      of: [{ type: "reference", to: { type: "filePath" } }],
    },
  ],
};
