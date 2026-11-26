import { navigationFor } from './navigation.ts';

const descriptions: Record<string, {description: string; phase: string}> = {
  'fundamentos/': { description: 'Métodos de interpretación, criterios de evidencia y fundamentos de la investigación bíblica.', phase: 'P4' },
  'estudios/': { description: 'Investigaciones organizadas por ejes temáticos, disciplinas y preguntas de estudio.', phase: 'P5–P6' },
  'biblioteca/': { description: 'Autores, obras, documentos y referencias teológicas con procedencia identificable.', phase: 'P7' },
  'historia/': { description: 'Contextos históricos, transmisión de las Escrituras y desarrollo del cristianismo.', phase: 'P7' },
  'linguistica/': { description: 'Lenguas originales, lemas, morfología, identificadores Strong y concordancias.', phase: 'P8' },
  'biblia/': { description: 'Consulta de ediciones bíblicas autorizadas y comparación de traducciones.', phase: 'P9' },
  'manuscritos/': { description: 'Testimonios manuscritos, variantes y fundamentos de crítica textual.', phase: 'P9' },
};

export function homeModules(base: string) {
  return navigationFor(base, '').filter(item => item.path !== '').map(item => ({
    ...item,
    ...descriptions[item.path],
  }));
}
