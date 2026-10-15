(function (root) {
  const languages = {
    en: { locale: "en-GB", catalogs: ["en-US", "en-GB", "es-419", "es-ES"] },
    es: { locale: "es-MX", catalogs: ["es-419", "es-ES", "en-US", "en-GB"] },
    "zh-CN": {
      locale: "zh-CN",
      catalogs: ["zh-Hans", "zh-Hant", "en-US", "en-GB"],
    },
    it: { locale: "it-IT", catalogs: ["it-IT", "en-US", "en-GB"] },
    fr: { locale: "fr-FR", catalogs: ["fr-FR", "fr-CA", "en-US", "en-GB"] },
    ja: { locale: "ja-JP", catalogs: ["ja-JP", "en-US", "en-GB"] },
    ru: { locale: "ru-RU", catalogs: ["ru-RU", "en-US", "en-GB"] },
  };
  if (typeof module === "object" && module.exports) module.exports = languages;
  else root.KIK_LANGUAGES = languages;
})(globalThis);
