import { SanityDocumentType } from "src/@types";

export const MaterialImageSha: SanityDocumentType = {
  name: "materialImageSha",
  title: "MaterialImageSha",
  type: "document",
  fields: [
    {
      name: "material",
      title: "Material",
      type: "reference",
      to: { type: "material" },
    },
    {
      name: "sha1",
      title: "sha1",
      type: "string",
    },
    {
      name: "process_status",
      title: "process_status",
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
