# Denazen website

## Localization

The site ships English and Spanish content side by side under `src/content/pages/`:
`*.en.ts` files pair with `*.es.ts` files (e.g. `index.en.ts` ↔ `index.es.ts`).

**Whenever you change user-facing copy in an `*.en.ts` file, mirror the change in the
matching `*.es.ts` file in the same commit.** This includes hero headings, taglines,
section copy, meta titles/descriptions, alt text, and button labels. The two locales
must stay in sync — never ship an English copy change without the Spanish translation.

The same rule applies to any future locales added under `src/content/pages/`.
