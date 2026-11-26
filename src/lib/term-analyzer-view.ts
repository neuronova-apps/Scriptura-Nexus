import type {createTermAnalyzer} from './term-analyzer.ts';
export type Analyzer=ReturnType<typeof createTermAnalyzer>;
export type Reference=Parameters<Analyzer['select']>[0];
type Selection=ReturnType<Analyzer['select']>;
type Analysis=ReturnType<Analyzer['analyze']>;
export const languageNames={hbo:'Hebreo',arc:'Arameo',grc:'Griego'} as const;
export const statusLabels={edicion_no_disponible:'Edición no disponible.',fuera_de_cobertura:'Libro fuera de la cobertura de esta edición.',unidad_no_disponible:'Referencia no disponible en esta edición.',ocurrencia_no_disponible:'Ocurrencia no disponible.',disponible:'Referencia disponible.',documentado:'Documentado',parcial:'Parcial',sin_interpretar:'Código sin interpretar',ausente:'No disponible',mixto_o_alternativo:'Mixto o alternativo',codigo_proveedor:'Código del proveedor',vinculado:'Lema vinculado'} as const;
export function createAnalyzerSession(engine:Analyzer){
 let selection:Selection|null=null;
 let result:Analysis|null=null;
 const reset=()=>{selection=null;result=null;};
 const consult=(reference:Reference)=>{
  reset();
  selection=engine.select(reference);
  return selection;
 };
 const choose=(id:string)=>{
  result=null;
  if(selection?.status!=='disponible'||!selection.occurrences.some(t=>t.id===id))return {status:'ocurrencia_no_disponible' as const,tokenId:id};
  result=engine.analyze(id);
  return result;
 };
 return {coverage:()=>engine.coverage(),reset,consult,choose};
}
