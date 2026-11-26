import axisData from '../data/taxonomia/ejes.json';
import disciplineData from '../data/taxonomia/disciplinas.json';
import methodData from '../data/taxonomia/metodos.json';
import traditionData from '../data/taxonomia/tradiciones.json';

export const axes = axisData.items;
export const disciplines = disciplineData.items;
export const methods = methodData.items;
export const traditions = traditionData.items;

export function getAxis(id: string) { return axes.find(item => item.id === id); }
export function getDiscipline(id: string) { return disciplines.find(item => item.id === id); }
export function getMethod(id: string) { return methods.find(item => item.id === id); }
export function getTradition(id: string) { return traditions.find(item => item.id === id); }
