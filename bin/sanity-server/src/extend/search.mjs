export const SearchExtend = () => {
  return {
    SearchTypeDefs: `
        input FilterType {
            must: [MustInput]
        }

        input MatchType {
            value: String
        }

        input LikeType {
            value: String
            threshold: Float
        }

        input MustInput {
            key: String
            match: MatchType
            like: LikeType
        }

        input SearchInput {
            filter: FilterType
            limit: Int
        }

        type Query {
            searchCollectionPoints(input: SearchInput): [String]
        }
    `,
    SearchQuery: {
      searchCollectionPoints(_parent, { input }) {
        console.log("input", input);
        return [
          "https://res.cloudinary.com/demo/image/upload/woman-blackdress-stairs.png",
          "https://res.cloudinary.com/demo/image/upload/woman-blackdress-stairs2.png",
          "https://res.cloudinary.com/demo/image/upload/woman-blackdress-stairs3.png",
        ];
      },
    },
  };
};
