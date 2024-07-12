import { SanityDocumentType } from "src/@types";

export const MaterialCrop: SanityDocumentType = {
  name: "materialCrop",
  title: "MaterialCrop",
  type: "document",
  fields: [
    {
      name: "material",
      title: "Material",
      type: "reference",
      to: { type: "material" },
    },
    {
      name: "x_axis",
      title: "x_axis",
      type: "number",
    },
    {
      name: "y_axis",
      title: "y_axis",
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
      name: "rotation",
      title: "Rotation",
      type: "number",
    },
    {
      name: "original_asset",
      title: "original_asset",
      type: "reference",
      to: { type: "asset" },
    },
    {
      name: "new_asset",
      title: "new_asset",
      type: "reference",
      to: { type: "asset" },
    },
    {
      name: "oss_key",
      title: "oss_key",
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
  ],
};
