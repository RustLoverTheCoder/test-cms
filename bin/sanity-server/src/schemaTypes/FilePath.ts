import { SanityDocumentType } from "src/@types";

export const FilePath: SanityDocumentType = {
  name: "filePath",
  title: "FilePath",
  type: "document",
  fields: [
    {
      name: "isDir",
      title: "IsDir",
      type: "boolean",
    },
    {
      name: "materializedPath",
      title: "MaterializedPath",
      type: "string",
    },
    {
      name: "name",
      title: "Name",
      type: "localizedString",
    },
    {
      name: "description",
      title: "description",
      type: "string",
    },
    {
      name: "assetObject",
      title: "AssetObject",
      type: "reference",
      to: { type: "assetObject" },
    },
  ],
};
