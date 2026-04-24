import { defaultLang, locales, type Lang } from './config';
import { ui, type UIKey } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, maybeLang] = url.pathname.split('/');
  if ((locales as string[]).includes(maybeLang)) return maybeLang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  if (clean === '/') return `/${lang}/`;
  return `/${lang}${clean}`;
}

export function stripLangFromPath(path: string): string {
  const parts = path.split('/');
  if (parts.length > 1 && (locales as string[]).includes(parts[1])) {
    const rest = '/' + parts.slice(2).join('/');
    return rest === '//' ? '/' : rest;
  }
  return path;
}

export function getAlternateUrls(currentPath: string, site: string | URL) {
  const basePath = stripLangFromPath(currentPath);
  const base = typeof site === 'string' ? new URL(site) : site;
  return locales.map((lang) => ({
    lang,
    href: new URL(localizePath(basePath, lang), base).href,
  }));
}
