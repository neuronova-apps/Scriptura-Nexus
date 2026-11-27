export const statusLabels: Record<string, string> = {planificado:'Planificado', en_investigacion:'En investigación', borrador:'Borrador', en_revision:'En revisión', publicado:'Publicado', actualizado:'Actualizado'};
export function matchesCatalogFilter(primary: string, status: string, axisFilter: string, statusFilter: string, profiles: readonly string[] = [], profileFilter = ''): boolean {
  return (!axisFilter || primary === axisFilter) && (!statusFilter || status === statusFilter) && (!profileFilter || (profileFilter === 'pendiente' ? profiles.length === 0 : profiles.includes(profileFilter)));
}
