import { defaultFieldResolver } from "graphql";
import { MapperKind, mapSchema } from "@graphql-tools/utils";

export function ExtendDirective() {
  return {
    DirectiveTypeDefs: `
      directive @transform(width: Int, height: Int) on FIELD \n 
      directive @gravity on FIELD \n 
      directive @nth(index: Int!) on FIELD \n 
    `,
    DirectiveTransformer: (schema) => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = async function (source, args, context, info) {
            const fieldNode = info.fieldNodes[0];
            const nthDirective = fieldNode.directives?.find(
              (directive) => directive.name.value === "nth"
            );

            if (nthDirective) {
              const indexArg = nthDirective.arguments?.find(
                (arg) => arg.name.value === "index"
              );
              const indexValue = indexArg
                ? info.variableValues?.[indexArg.value.name.value]
                : null;
              if (indexValue) {
                context.nthIndex = indexValue;
              }
            }
            let result = await resolve(source, args, context, info);
            const transformDirective = fieldNode.directives?.find(
              (directive) => directive.name.value === "transform"
            );
            if (transformDirective) {
              const widthArg = transformDirective.arguments?.find(
                (arg) => arg.name.value === "width"
              );

              const widthValue = widthArg
                ? info.variableValues?.[widthArg.value.name.value]
                : null;
              const heightArg = transformDirective.arguments?.find(
                (arg) => arg.name.value === "height"
              );
              const heightValue = heightArg
                ? info.variableValues?.[heightArg.value.name.value]
                : null;
              if (heightValue || widthValue) {
                const url = new URL(result);
                if (!!widthValue) {
                  url.searchParams.set("w", widthValue);
                }
                if (!!heightValue) {
                  url.searchParams.set("h", heightValue);
                }
                result = url;
              }
            }

            const gravityDirective = fieldNode.directives?.find(
              (directive) => directive.name.value === "gravity"
            );

            if (gravityDirective) {
              const url = new URL(result);
              url.searchParams.set("g", "face");
              result = url;
            }

            return result;
          };

          return fieldConfig;
        },
      });
    },
  };
}
