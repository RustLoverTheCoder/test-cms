import { Schema } from "@sanity/schema";

import { AssetObject } from "./AssetObject.mjs";
import { FilePath } from "./FilePath.mjs";
import { MediaData } from "./MediaData.mjs";

export const schemaTypes = [AssetObject, FilePath, MediaData];

export const schema = new Schema({
  name: "test",
  types: schemaTypes,
});
