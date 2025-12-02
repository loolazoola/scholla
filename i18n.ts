import { getRequestConfig } from "next-intl/server";

// Supported locales
export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "en";

export default getRequestConfig(async () => {
  // Always use default locale for now (simplified setup)
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
