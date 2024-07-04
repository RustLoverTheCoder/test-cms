export const Author = {
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "age",
      title: "Age",
      type: "number",
    },
    {
      name: "posts",
      title: "Posts",
      type: "array",
      of: [{ type: "reference", to: { type: "post" } }],
    },
  ],
};
