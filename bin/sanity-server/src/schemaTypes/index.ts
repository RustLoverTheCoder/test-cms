import { Schema } from "@sanity/schema";

import { AssetObject } from "./AssetObject";
import { FilePath } from "./FilePath";
import { MediaData } from "./MediaData";
import { SanityDocumentType } from "src/@types";

export const schemaTypes: SanityDocumentType[] = [
  AssetObject,
  FilePath,
  MediaData,
];

export const schema = new Schema({
  name: "cms",
  types: schemaTypes,
});
