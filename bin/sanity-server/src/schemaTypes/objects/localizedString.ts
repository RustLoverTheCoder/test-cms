import { SanityObjectType } from "src/@types";
import { i18n } from "./i18n";

export const LocalizedString: SanityObjectType = {
  name: "localizedString",
  title: "Localized String",
  type: "object",
  fields: i18n.languages.map((lang) => {
    return {
      name: lang.id,
      title: lang.title,
      type: "string",
    };
  }),
};
