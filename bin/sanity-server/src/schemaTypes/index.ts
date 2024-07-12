import { Schema } from "@sanity/schema";

import { Asset } from "./Asset";
import { AssetThumbnail } from "./AssetThumbnail";
import { AssetOCR } from "./AssetOCR";
import { AssetSprite } from "./AssetSprite";
import { LocalizedString } from "./objects/localizedString";
import { User } from "./user";
import { Folder } from "./Folder";
import { MoveFolderHistory } from "./MoveFolderHistory";
import { SmartFolder } from "./SmartFolder";
import { SmartGroup } from "./SmartGroup";
import { Material } from "./material";
import { MaterialCrop } from "./MaterialCrop";
import { MaterialImageSha } from "./MaterialImageSha";
import { Tag } from "./Tag";
import { TagGroup } from "./TagGroup";
import { SanityDocumentType, SanityObjectType } from "src/@types";

// 必须有user
export const schemaTypes: (SanityDocumentType | SanityObjectType)[] = [
  User,
  Asset,
  AssetThumbnail,
  AssetOCR,
  AssetSprite,
  Folder,
  MoveFolderHistory,
  SmartFolder,
  SmartGroup,
  Material,
  MaterialCrop,
  MaterialImageSha,
  Tag,
  TagGroup,
  LocalizedString,
];

export const objectTypes = ["localizedString"] as const;

export const schema = new Schema({
  name: "cms",
  types: schemaTypes,
});
