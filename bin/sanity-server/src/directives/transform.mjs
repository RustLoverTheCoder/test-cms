import { defaultFieldResolver } from "graphql";
import { MapperKind, mapSchema } from "@graphql-tools/utils";

export function ExtendDirective() {
  return {
    DirectiveTypeDefs: `
      directive @transform(width: Int, height: Int) on FIELD \n 
      directive @gravity on FIELD \n 
    `,
    DirectiveTransformer: (schema) => {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = async function (source, args, context, info) {
            let result = await resolve(source, args, context, info);
            console.log("info.variableValues", info.variableValues);
            const fieldNode = info.fieldNodes[0];
            const directive = fieldNode.directives?.find(
              (directive) => directive.name.value === "transform"
            );
            if (directive) {
              const widthArg = directive.arguments?.find(
                (arg) => arg.name.value === "width"
              );

              const widthValue = widthArg
                ? info.variableValues?.[widthArg.value.name.value]
                : null;
              const heightArg = directive.arguments?.find(
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
