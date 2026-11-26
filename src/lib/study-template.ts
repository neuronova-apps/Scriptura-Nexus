import { makeSections, type Section, type SectionState } from './editorial-contracts.ts';
export const sectionGuidance = [
  {
    "order": 1,
    "procedure": "ID estable, título, eje, disciplinas, etiquetas, responsable, versión, estado y fecha.",
    "deliverable": "Ficha de estudio"
  },
  {
    "order": 2,
    "procedure": "Pregunta neutral, alcance, controversia, hipótesis alternativas y objetivo.",
    "deliverable": "Pregunta delimitada"
  },
  {
    "order": 3,
    "procedure": "Historia de la cuestión y recepción; distinguir fechas seguras y discutidas.",
    "deliverable": "Cronología documentada"
  },
  {
    "order": 4,
    "procedure": "Pasajes principales y complementarios, edición, canon y límites de la perícopa.",
    "deliverable": "Inventario de pasajes"
  },
  {
    "order": 5,
    "procedure": "Autoría, destinatarios, lugar, época, instituciones y costumbres; indicar incertidumbre.",
    "deliverable": "Evidencias contextualizadas"
  },
  {
    "order": 6,
    "procedure": "Género, estructura, argumento, voz narrativa y propósito.",
    "deliverable": "Mapa literario"
  },
  {
    "order": 7,
    "procedure": "Formas originales, lema, Strong, morfología, sintaxis, semántica y uso contextual.",
    "deliverable": "Ficha por término"
  },
  {
    "order": 8,
    "procedure": "Variantes relevantes, testigos, ediciones y criterios de valoración.",
    "deliverable": "Ficha de variantes"
  },
  {
    "order": 9,
    "procedure": "Versiones identificadas, diferencias y posibles causas.",
    "deliverable": "Matriz de traducciones"
  },
  {
    "order": 10,
    "procedure": "Interpretaciones del pasaje sustentadas en la evidencia y sus alternativas.",
    "deliverable": "Argumentación exegética"
  },
  {
    "order": 11,
    "procedure": "Citas, alusiones, paralelos y relaciones canónicas, distinguiendo grados de conexión.",
    "deliverable": "Mapa de relaciones"
  },
  {
    "order": 12,
    "procedure": "Recepción patrística, medieval, Reforma y contemporánea según pertinencia.",
    "deliverable": "Registro de autores y obras"
  },
  {
    "order": 13,
    "procedure": "Fuentes institucionales y especialistas; diversidad interna y fundamentos.",
    "deliverable": "Ficha confesional T01"
  },
  {
    "order": 14,
    "procedure": "Corrientes relevantes, convergencias y discrepancias.",
    "deliverable": "Ficha confesional T02"
  },
  {
    "order": 15,
    "procedure": "Exégesis, teología, Magisterio y grado de autoridad del documento.",
    "deliverable": "Ficha confesional T03"
  },
  {
    "order": 16,
    "procedure": "Ortodoxa, judía y académica según pertinencia; evitar anacronismos.",
    "deliverable": "Fichas T04/T05/A01"
  },
  {
    "order": 17,
    "procedure": "Argumentos, contraargumentos, evidencias, presupuestos y límites.",
    "deliverable": "Matriz comparativa"
  },
  {
    "order": 18,
    "procedure": "Distinguir norma, principio, contexto, tradición y conciencia; justificar el puente hermenéutico.",
    "deliverable": "Implicaciones delimitadas"
  },
  {
    "order": 19,
    "procedure": "Respuesta a la pregunta, grado de respaldo, reservas y asuntos pendientes.",
    "deliverable": "Síntesis revisable"
  },
  {
    "order": 20,
    "procedure": "Fuentes consultadas, localizadores, edición, enlace, licencias y registro de cambios.",
    "deliverable": "Bibliografía trazable"
  }
] as const;
export const sectionStateLabels: Record<SectionState,string> = {pendiente:'Pendiente',aplicable:'Aplicable',no_aplicable:'No aplicable',analizada:'Analizada',revisada:'Revisada'};
export interface SectionView { id:string; anchor:string; order:number; title:string; state:SectionState; label:string; procedure:string; deliverable:string; explanation:string; body?:string }
export function sectionView(section:Section, resolveContent:(reference:string)=>string|undefined=()=>undefined):SectionView {
  const guide=sectionGuidance[section.order-1];
  if(!guide||!Number.isInteger(section.order)) throw new Error('Posición inválida');
  const anchor='seccion-'+String(section.order).padStart(2,'0');
  let explanation:string;
  let body:string|undefined;
  switch(section.applicability){
    case 'pendiente': explanation=section.justification?.trim()||'Contenido pendiente de investigación y revisión.'; break;
    case 'aplicable': explanation='Sección aplicable; su desarrollo aún no está aprobado.'; break;
    case 'no_aplicable':
      if(!section.justification?.trim())throw new Error('Omisión sin justificación');
      explanation=section.justification; break;
    case 'analizada':
    case 'revisada':
      if(!section.contentRef?.trim())throw new Error('Referencia de contenido requerida');
      body=resolveContent(section.contentRef);
      if(!body?.trim())throw new Error('Contenido no resuelto');
      explanation=section.applicability==='analizada'?'Contenido analizado; no equivale a publicación aprobada.':'Contenido revisado; no equivale a publicación aprobada.';
      break;
    default: throw new Error('Estado inválido');
  }
  return {id:section.id,anchor,order:section.order,title:section.title,state:section.applicability,label:sectionStateLabels[section.applicability],procedure:guide.procedure,deliverable:guide.deliverable,explanation,...(body===undefined?{}:{body})};
}
// Public route receives only generated pending sections; no draft or review content source.
export function plannedTemplate(studyId:string):SectionView[] {return makeSections(studyId).map(section=>sectionView(section));}
