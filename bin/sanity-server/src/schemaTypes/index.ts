import { Schema } from "@sanity/schema";

import { AssetObject } from "./AssetObject";
import { FilePath } from "./FilePath";
import { MediaData } from "./MediaData";

export const schemaTypes = [AssetObject, FilePath, MediaData];

export const schema = new Schema({
  name: "test",
  types: schemaTypes,
});
