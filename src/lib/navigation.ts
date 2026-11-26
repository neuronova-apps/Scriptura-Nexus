import { basePath } from './site.ts';

export const navigationItems = [
  { label: 'Inicio', path: '', available: true },
  { label: 'Fundamentos', path: 'fundamentos/', available: true },
  { label: 'Estudios bíblicos', path: 'estudios/', available: true },
  { label: 'Biblioteca teológica', path: 'biblioteca/', available: true },
  { label: 'Historia cristiana', path: 'historia/', available: true },
  { label: 'Análisis lingüístico', path: 'linguistica/', available: true },
  { label: 'Biblia y comparación', path: 'biblia/', available: true },
  { label: 'Manuscritos', path: 'manuscritos/', available: true },
] as const;

/** available indica una ruta existente, no un módulo funcional completo. */
export function navigationFor(base: string, pathname: string) {
  const normalize = (path: string) => path.replace(/\/+$/, '') + '/';
  return navigationItems.map(item => ({
    ...item,
    href: item.available ? basePath(base, item.path) : null,
    current: item.available && normalize(pathname) === normalize(basePath(base, item.path)),
  }));
}
