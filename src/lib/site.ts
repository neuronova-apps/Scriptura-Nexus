export function basePath(base: string, path = ''): string {
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}
