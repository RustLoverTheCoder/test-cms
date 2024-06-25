import { defaultFieldResolver, GraphQLSchema } from "graphql";
import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";

export function transformDirective(directiveName) {
  return {
    transformDirectiveTypeDefs: `directive @${directiveName}(width: Int, height: Int) on FIELD`,
    transformDirectiveTransformer: (schema) => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = async function (source, args, context, info) {
            let result = await resolve(source, args, context, info);
            const fieldNode = info.fieldNodes[0];
            const directive = fieldNode.directives?.find(
              (directive) => directive.name.value === directiveName
            );
            if (directive) {
              const widthArg = directive.arguments?.find(
                (arg) => arg.name.value === "width"
              );
              const widthValue = widthArg ? info.variableValues?.width : null;
              const heightArg = directive.arguments?.find(
                (arg) => arg.name.value === "height"
              );
              const heightValue = heightArg
                ? info.variableValues?.height
                : null;
              if (heightValue || widthValue) {
                const url = new URL(result);
                if (widthValue !== undefined) {
                  url.searchParams.set("w", widthValue);
                }
                if (heightValue !== undefined) {
                  url.searchParams.set("h", widthValue);
                }
                return url;
              }
              return result;
            }
            return result;
          };

          return fieldConfig;
        },
      });
    },
  };
}
