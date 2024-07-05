export const generateImageTypeDefsAndResolvers = () => {
  const typeDefs = `

input SanityImageDimensionsFilter {
  _key: StringFilter
  _type: StringFilter
  height: FloatFilter
  width: FloatFilter
  aspectRatio: FloatFilter
}
  
input SanityImageMetadataFilter {
  _key: StringFilter
  _type: StringFilter
  location: GeopointFilter
  dimensions: SanityImageDimensionsFilter
  ## palette: SanityImagePaletteFilter ##todo
  lqip: StringFilter
  blurHash: StringFilter
  hasAlpha: BooleanFilter
  isOpaque: BooleanFilter
}
      
input SanityImageAssetFilter {
  """Apply filters on document level"""
  _: Sanity_DocumentFilter
  _id: IDFilter
  _type: StringFilter
  _createdAt: DatetimeFilter
  _updatedAt: DatetimeFilter
  _rev: StringFilter
  _key: StringFilter
  originalFilename: StringFilter
  label: StringFilter
  title: StringFilter
  description: StringFilter
  altText: StringFilter
  sha1hash: StringFilter
  extension: StringFilter
  mimeType: StringFilter
  size: FloatFilter
  assetId: StringFilter
  uploadId: StringFilter
  path: StringFilter
  url: StringFilter
  metadata: SanityImageMetadataFilter
  source: SanityAssetSourceDataFilter
}


input SanityImageDimensionsSorting {
  _key: SortOrder
  _type: SortOrder
  height: SortOrder
  width: SortOrder
  aspectRatio: SortOrder
}

input SanityImageMetadataSorting {
  _key: SortOrder
  _type: SortOrder
  location: GeopointSorting
  dimensions: SanityImageDimensionsSorting
  ## palette: SanityImagePaletteSorting ## todo
  lqip: SortOrder
  blurHash: SortOrder
  hasAlpha: SortOrder
  isOpaque: SortOrder
}

input SanityImageAssetSorting {
  _id: SortOrder
  _type: SortOrder
  _createdAt: SortOrder
  _updatedAt: SortOrder
  _rev: SortOrder
  _key: SortOrder
  originalFilename: SortOrder
  label: SortOrder
  title: SortOrder
  description: SortOrder
  altText: SortOrder
  sha1hash: SortOrder
  extension: SortOrder
  mimeType: SortOrder
  size: SortOrder
  assetId: SortOrder
  uploadId: SortOrder
  path: SortOrder
  url: SortOrder
  metadata: SanityImageMetadataSorting
  source: SanityAssetSourceDataSorting
}
    `;

  const resolvers:any = { Query: {}, Mutation: {} };

  const queryFields = [];
  const mutaionFields:any = [];

  queryFields.push(`
      SanityImageAsset(id: ID!): SanityImageAsset
      allSanityImageAsset(where: SanityImageAssetFilter,sort: [SanityImageAssetSorting!],limit: Int,offset: Int): [SanityImageAsset!]
  `);

  resolvers.Query.SanityImageAsset = async (_parent:any, input:any) => {
    // const Model = models?.["file"];
    // 还需要生成mongoose
    return null;
  };

  resolvers.Query.allSanityImageAsset = async (
    _:any,
    { where, sort, offset, limit }:any,
    _context:any
  ) => {
    console.log("allSanityFileAsset", where, sort, offset, limit);
    return [];
  };

  console.log("resolvers", resolvers);
  return {
    typeDefs,
    resolvers,
    queryFields,
    mutaionFields,
  };
};
