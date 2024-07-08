import { Schema } from "@sanity/schema";

import { AssetObject } from "./AssetObject";
import { FilePath } from "./FilePath";
import { MediaData } from "./MediaData";
import { LocalizedString } from "./objects/localizedString";
import { SanityDocumentType, SanityObjectType } from "src/@types";

export const schemaTypes: (SanityDocumentType | SanityObjectType)[] = [
  AssetObject,
  FilePath,
  MediaData,
  LocalizedString,
];

export const objectTypes = ["localizedString"] as const;

export const schema = new Schema({
  name: "cms",
  types: schemaTypes,
});
