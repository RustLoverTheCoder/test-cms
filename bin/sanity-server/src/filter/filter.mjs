export const FilterInput = `

input Sanity_DocumentFilter {
  """All documents referencing the given document ID."""
  references: ID

  """All documents that are drafts."""
  is_draft: Boolean
}

input IDFilter {
  """Checks if the value is equal to the given input."""
  eq: ID

  """Checks if the value is not equal to the given input."""
  neq: ID

  """Checks if the value matches the given word/words."""
  matches: ID
  in: [ID!]
  nin: [ID!]
}

input StringFilter {
  """Checks if the value is equal to the given input."""
  eq: String

  """Checks if the value is not equal to the given input."""
  neq: String

  """Checks if the value matches the given word/words."""
  matches: String
  in: [String!]
  nin: [String!]

  """Checks if the value is defined."""
  is_defined: Boolean
}

input DatetimeFilter {
  """Checks if the value is equal to the given input."""
  eq: DateTime

  """Checks if the value is not equal to the given input."""
  neq: DateTime

  """Checks if the value is greater than the given input."""
  gt: DateTime

  """Checks if the value is greater than or equal to the given input."""
  gte: DateTime

  """Checks if the value is lesser than the given input."""
  lt: DateTime

  """Checks if the value is lesser than or equal to the given input."""
  lte: DateTime

  """Checks if the value is defined."""
  is_defined: Boolean
}

input SlugFilter {
  _key: StringFilter
  _type: StringFilter
  current: StringFilter
  source: StringFilter
}

input ImageFilter {
  _key: StringFilter
  _type: StringFilter
}

`;
