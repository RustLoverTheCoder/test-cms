const languages = [
    { id: "en", title: "English", isDefault: true },
    { id: "nl", title: "Dutch" },
    { id: "no", title: "Norwegian" },
  ];
  
  export const i18n = {
    languages,
    base: languages.find((item) => item.isDefault)?.id || languages[0].id,
  };
  