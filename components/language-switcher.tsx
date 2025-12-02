"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales } from "@/i18n";

export function LanguageSwitcher() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname if it exists
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, "");

    // Navigate to the new locale
    const newPath =
      newLocale === "en"
        ? pathnameWithoutLocale || "/"
        : `/${newLocale}${pathnameWithoutLocale || "/"}`;

    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language-select" className="text-sm font-medium">
        {t("language")}:
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === "en" ? "English" : "Bahasa Indonesia"}
          </option>
        ))}
      </select>
    </div>
  );
}
