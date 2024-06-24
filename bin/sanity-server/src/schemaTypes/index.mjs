import { Schema } from "@sanity/schema";

import { Post } from "./post.mjs";
import { Author } from "./author.mjs";

export const schemaTypes = [Post, Author];

export const schema = new Schema({
  name: "test",
  types: schemaTypes,
});
