import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";

/**
 * Get the current locale from the request
 */
export async function getLocale() {
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") || "en";
  return locale;
}

/**
 * Get translations for server components
 * Usage: const t = await getTranslations('common');
 */
export { getTranslations } from "next-intl/server";

/**
 * Format a date according to the current locale
 */
export function formatDate(date: Date, locale: string = "en") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format a date and time according to the current locale
 */
export function formatDateTime(date: Date, locale: string = "en") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format a number according to the current locale
 */
export function formatNumber(number: number, locale: string = "en") {
  return new Intl.NumberFormat(locale).format(number);
}
