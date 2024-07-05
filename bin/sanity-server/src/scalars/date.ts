import { GraphQLScalarType, Kind } from "graphql";

const GraphQLDate = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  parseValue(value:any) {
    if (!value) return null;
    return new Date(parseInt(value, 10));
  },
  serialize(value) {
    if (!(value instanceof Date)) return null;
    return value.getTime();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

export default GraphQLDate;
