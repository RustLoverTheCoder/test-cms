import { defaultFieldResolver, GraphQLSchema } from "graphql";
import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";

export function transformDirective(directiveName) {
  return {
    transformDirectiveTypeDefs: `directive @${directiveName}(widht: Int, height: Int) on FIELD`,
    transformDirectiveTransformer: (schema) => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = async function (source, args, context, info) {
            let result = await resolve(source, args, context, info);

            const fieldNode = info.fieldNodes[0];
            const directive = fieldNode.directives?.find(directive => directive.name.value === directiveName);
            if (directive && typeof result === 'string') {
              return result.toUpperCase();
            }

            // if (directives && directives.length > 0) {
            //   const directiveArgs = directives[0];
            //   const { width, height } = directiveArgs;

            //   if (typeof result === "string") {
            //     const url = new URL(result);
            //     if (width !== undefined) {
            //       url.searchParams.set("w", width);
            //     }
            //     if (height !== undefined) {
            //       url.searchParams.set("h", height);
            //     }
            //     result = url.toString();
            //   }
            // }

            return result;
          };

          return fieldConfig;
        },
      });
    },
  };
}
