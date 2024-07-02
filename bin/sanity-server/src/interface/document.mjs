export const DocumentInterfaceFields = `
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
`;

export const DocumentInterface = `
"""A Sanity document"""
interface Document {
    ${DocumentInterfaceFields}
}
`;
