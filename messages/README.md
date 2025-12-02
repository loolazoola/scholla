# Internationalization (i18n) Setup

This directory contains translation files for the School Management System.

## Supported Languages

- **English (en)** - Default language
- **Bahasa Indonesia (id)** - Indonesian language

## File Structure

```
messages/
├── en.json     # English translations
├── id.json     # Indonesian translations
└── README.md   # This file
```

## Translation Keys Organization

Translations are organized by feature area:

- `common` - Common UI elements (buttons, labels, etc.)
- `auth` - Authentication related
- `dashboard` - Dashboard pages
- `admin` - Admin-specific features
- `teacher` - Teacher-specific features
- `student` - Student-specific features
- `users` - User management
- `classes` - Class management
- `enrollment` - Enrollment features
- `grades` - Grading and gradebook
- `assignments` - Assignment management
- `exams` - Exam management
- `announcements` - Announcements
- `notifications` - Notifications
- `reports` - Reporting features
- `settings` - Settings and preferences
- `errors` - Error messages
- `validation` - Validation messages

## Usage

### Server Components

```typescript
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("common");

  return <h1>{t("welcome")}</h1>;
}
```

### Client Components

```typescript
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("common");

  return <button>{t("save")}</button>;
}
```

### With Parameters

```typescript
// Translation: "Welcome, {name}"
t("dashboard.welcome", { name: "John" });
// Output: "Welcome, John"
```

### Pluralization

```typescript
// Translation: "{count, plural, =0 {No items} =1 {One item} other {# items}}"
t("items", { count: 5 });
// Output: "5 items"
```

## Adding New Translations

1. Add the key to both `en.json` and `id.json`
2. Use descriptive keys that indicate the context
3. Keep the structure consistent between languages
4. Use parameters for dynamic content: `{variableName}`

Example:

```json
{
  "users": {
    "greeting": "Hello, {name}!",
    "itemCount": "You have {count} items"
  }
}
```

## Language Switcher

The `LanguageSwitcher` component allows users to change their language preference:

```typescript
import { LanguageSwitcher } from "@/components/language-switcher";

<LanguageSwitcher />;
```

## Locale Detection

The system detects the user's locale in this order:

1. User's saved locale preference (from database)
2. Browser's language setting
3. Default locale (English)

## Date and Number Formatting

Use the helper functions for locale-aware formatting:

```typescript
import { formatDate, formatDateTime, formatNumber } from "@/lib/i18n-helpers";

formatDate(new Date(), "en"); // "January 1, 2024"
formatDate(new Date(), "id"); // "1 Januari 2024"
formatDateTime(new Date(), "en"); // "January 1, 2024, 10:30 AM"
formatNumber(1234.56, "en"); // "1,234.56"
formatNumber(1234.56, "id"); // "1.234,56"
```

## Best Practices

1. **Always provide translations for both languages**
2. **Use meaningful key names** - `users.createButton` not `btn1`
3. **Keep translations short and clear**
4. **Test in both languages** to ensure UI doesn't break
5. **Use parameters** for dynamic content instead of string concatenation
6. **Maintain consistent terminology** across the application
7. **Consider cultural differences** in date formats, number formats, etc.

## Translation Guidelines

### English (en)

- Use American English spelling
- Keep tone professional but friendly
- Use active voice
- Be concise

### Bahasa Indonesia (id)

- Use formal Indonesian (Bahasa Indonesia Baku)
- Maintain professional tone
- Use appropriate honorifics where needed
- Keep translations natural, not literal

## Adding a New Language

To add support for a new language:

1. Create a new JSON file: `messages/{locale}.json`
2. Copy the structure from `en.json`
3. Translate all keys
4. Add the locale to `i18n.ts`:
   ```typescript
   export const locales = ["en", "id", "new-locale"] as const;
   ```
5. Update the `LanguageSwitcher` component to include the new language

## Testing Translations

1. Switch between languages using the language switcher
2. Check all pages and features in both languages
3. Verify that dynamic content (dates, numbers) formats correctly
4. Ensure UI doesn't break with longer translations
5. Test with missing translations (should fall back to key name)
