import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultLang, type Lang } from './config';

const publicDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'public',
);

export function localizeAsset(assetPath: string, lang: Lang): string {
  if (lang === defaultLang) return assetPath;
  if (/^(https?:)?\/\//.test(assetPath)) return assetPath;
  if (assetPath.startsWith('data:')) return assetPath;

  const localizedPath = insertLocaleSegment(assetPath, lang);
  const relative = localizedPath.replace(/^\//, '');
  const fsPath = path.join(publicDir, relative);
  try {
    if (fs.existsSync(fsPath)) return localizedPath;
  } catch {
    // ignore — fall through to default
  }
  return assetPath;
}

function insertLocaleSegment(assetPath: string, lang: Lang): string {
  const lastSlash = assetPath.lastIndexOf('/');
  if (lastSlash === -1) return `${lang}/${assetPath}`;
  return `${assetPath.slice(0, lastSlash)}/${lang}${assetPath.slice(lastSlash)}`;
}
