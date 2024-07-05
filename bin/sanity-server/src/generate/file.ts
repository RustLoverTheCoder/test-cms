export const generateFileTypeDefsAndResolvers = () => {
  const typeDefs = `
type File {
    _key: String
    _type: String
    asset: SanityFileAsset
}

input FileFilter {
  _key: StringFilter
  _type: StringFilter
  asset: SanityFileAssetFilter
}

input FileSorting {
  _key: SortOrder
  _type: SortOrder
}

type SanityFileAsset implements Document @authenticated @key(fields: "_id") {
  """Document ID"""
  _id: ID

  """Document type"""
  _type: String

  """Date the document was created"""
  _createdAt: DateTime

  """Date the document was last modified"""
  _updatedAt: DateTime

  """Current document revision"""
  _rev: String
  _key: String
  originalFilename: String
  label: String
  title: String
  description: String
  altText: String
  sha1hash: String
  extension: String
  mimeType: String
  size: Float
  assetId: String
  uploadId: String
  path: String
  url: String
  source: SanityAssetSourceData
}

input SanityAssetSourceDataFilter {
  _key: StringFilter
  _type: StringFilter
  name: StringFilter
  id: StringFilter
  url: StringFilter
}

input SanityFileAssetFilter {
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
  source: SanityAssetSourceDataFilter
}


input SanityAssetSourceDataSorting {
  _key: SortOrder
  _type: SortOrder
  name: SortOrder
  id: SortOrder
  url: SortOrder
}

input SanityFileAssetSorting {
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
  source: SanityAssetSourceDataSorting
}


  `;

  const resolvers: any = { Query: {}, Mutation: {} };

  const queryFields: any = [];
  const mutaionFields: any = [];

  queryFields.push(`
    SanityFileAsset(id: ID!): SanityFileAsset
    allSanityFileAsset(where: SanityFileAssetFilter,sort: [SanityFileAssetSorting!],limit: Int,offset: Int): [SanityFileAsset!]
`);

  resolvers.Query.SanityFileAsset = async (_parent: any, input: any) => {
    // const Model = models?.["file"];
    // 还需要生成mongoose
    return null;
  };

  resolvers.Query.allSanityFileAsset = async (
    _: any,
    { where, sort, offset, limit }: any,
    _context: any
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
