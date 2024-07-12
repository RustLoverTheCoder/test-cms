import { SanityDocumentType } from "src/@types";

export const AssetSprite: SanityDocumentType = {
  name: "assetSprite",
  title: "AssetSprite",
  type: "document",
  fields: [
    {
      name: "asset",
      title: "Asset",
      type: "reference",
      to: { type: "asset" },
    },
    {
      name: "sprite",
      title: "Sprite",
      type: "blockContent",
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
