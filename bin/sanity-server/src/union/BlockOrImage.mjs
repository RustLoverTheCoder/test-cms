// Image 缺少 hotspot 和 crop
export const BlockOrImageUnion = `
union BlockOrImage = Block | Image

input BooleanFilter {
  """Checks if the value is equal to the given input."""
  eq: Boolean

  """Checks if the value is not equal to the given input."""
  neq: Boolean

  """Checks if the value is defined."""
  is_defined: Boolean
}

type Block {
  _key: String
  _type: String
  children: [Span]
  style: String
  listItem: String
  level: Float
}

type Span {
  _key: String
  _type: String
  marks: [String]
  text: String
}

type Image {
  _key: String
  _type: String
  asset: SanityImageAsset
}

type SanityImageAsset implements Document {
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
  metadata: SanityImageMetadata
  source: SanityAssetSourceData
}


type SanityImageMetadata {
  _key: String
  _type: String
  location: Geopoint
  dimensions: SanityImageDimensions
  palette: SanityImagePalette
  lqip: String
  blurHash: String
  hasAlpha: Boolean
  isOpaque: Boolean
}

type SanityAssetSourceData {
  _key: String
  _type: String

  """A canonical name for the source this asset is originating from"""
  name: String

  """
  The unique ID for the asset within the originating source so you can programatically find back to it
  """
  id: String

  """
  A URL to find more information about this asset in the originating source
  """
  url: String
}

type Geopoint {
  _key: String
  _type: String
  lat: Float
  lng: Float
  alt: Float
}

input GeopointFilter {
  _key: StringFilter
  _type: StringFilter
  lat: FloatFilter
  lng: FloatFilter
  alt: FloatFilter
}


input GeopointSorting {
  _key: SortOrder
  _type: SortOrder
  lat: SortOrder
  lng: SortOrder
  alt: SortOrder
}





type SanityImageDimensions {
    _key: String
    _type: String
    height: Float
    width: Float
    aspectRatio: Float
}

type SanityImagePalette {
  _key: String
  _type: String
  darkMuted: SanityImagePaletteSwatch
  lightVibrant: SanityImagePaletteSwatch
  darkVibrant: SanityImagePaletteSwatch
  vibrant: SanityImagePaletteSwatch
  dominant: SanityImagePaletteSwatch
  lightMuted: SanityImagePaletteSwatch
  muted: SanityImagePaletteSwatch
}



type SanityImagePaletteSwatch {
  _key: String
  _type: String
  background: String
  foreground: String
  population: Float
  title: String
}

`;
