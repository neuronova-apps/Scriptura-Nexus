export const studyModuleRoutes = {
 reader:{path:'biblia/lector/',anchor:'br-reference-title',label:'Lector bíblico',availability:'Sin ediciones públicas autorizadas.'},
 analyzer:{path:'linguistica/analizador/',anchor:'ta-reference-title',label:'Analizador lingüístico',availability:'Sin corpus lingüístico público autorizado.'},
 lexicon:{path:'linguistica/lexicos-concordancias/',anchor:'lc-lex-title',label:'Léxicos y concordancias',availability:'Sin diccionarios públicos autorizados.'},
 concordance:{path:'linguistica/lexicos-concordancias/',anchor:'lc-con-title',label:'Concordancias y frecuencias',availability:'Sin corpus público autorizado; no se infieren frecuencias.'},
 comparator:{path:'biblia/comparador/',anchor:'bc-selection-title',label:'Comparador bíblico',availability:'Sin ediciones ni correspondencias públicas autorizadas.'},
 manuscripts:{path:'manuscritos/consulta/',anchor:'mv-variant-title',label:'Manuscritos y variantes',availability:'Sin testimonios admitidos para este estudio.'},
 library:{path:'biblioteca/',anchor:'documentos-titulo',label:'Biblioteca teológica',availability:'Catálogo público independiente; fuentes de SN-001 aún candidatas.'},
 history:{path:'historia/',anchor:'historia-relacionada',label:'Historia cristiana',availability:'Consulta complementaria; no constituye evidencia histórica de SN-001.'}
} as const;
export type StudyModuleKey=keyof typeof studyModuleRoutes;
export function studyModuleHref(base:string,key:StudyModuleKey):string{
 const r=studyModuleRoutes[key];return base.replace(/\/+$/,'')+'/'+r.path+'#'+r.anchor;
}
