import { basePath } from './site.ts';

export const navigationItems = [
  { label: 'Inicio', path: '', available: true },
  { label: 'Fundamentos', path: 'fundamentos/', available: false },
  { label: 'Estudios bíblicos', path: 'estudios/', available: false },
  { label: 'Biblioteca teológica', path: 'biblioteca/', available: false },
  { label: 'Historia cristiana', path: 'historia/', available: false },
  { label: 'Análisis lingüístico', path: 'linguistica/', available: false },
  { label: 'Biblia y comparación', path: 'biblia/', available: false },
  { label: 'Manuscritos', path: 'manuscritos/', available: false },
] as const;

/** Solo las páginas disponibles reciben enlaces; P3.3 habilitará las rutas iniciales. */
export function navigationFor(base: string, pathname: string) {
  const normalize = (path: string) => path.replace(/\/+$/, '') + '/';
  return navigationItems.map(item => ({
    ...item,
    href: item.available ? basePath(base, item.path) : null,
    current: item.available && normalize(pathname) === normalize(basePath(base, item.path)),
  }));
}
