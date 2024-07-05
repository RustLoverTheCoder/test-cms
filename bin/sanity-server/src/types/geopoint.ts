export const GeopointType = `
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
`;
