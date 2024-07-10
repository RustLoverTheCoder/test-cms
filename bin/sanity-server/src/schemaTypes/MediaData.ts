import { SanityDocumentType } from "src/@types";

export const MediaData: SanityDocumentType = {
  name: "mediaData",
  title: "MediaData",
  type: "document",
  fields: [
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
      name: "duration",
      title: "Duration",
      type: "number",
    },
    {
      name: "bitRate",
      title: "BitRate",
      type: "number",
    },
    {
      name: "hasAudio",
      title: "HasAudio",
      type: "boolean",
    },
    {
      name: "assetObject",
      title: "AssetObject",
      type: "reference",
      to: { type: "assetObject" },
    }
  ],
};
