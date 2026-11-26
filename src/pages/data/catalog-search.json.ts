import { studies } from '../../lib/catalog';
import { axes } from '../../lib/taxonomy';
import { createSearchIndex, SEARCH_INDEX_VERSION } from '../../lib/catalog-search';
export const prerender = true;
export function GET() {
  return new Response(JSON.stringify({schemaVersion:SEARCH_INDEX_VERSION, items:createSearchIndex(studies,axes)}), {headers:{'Content-Type':'application/json; charset=utf-8'}});
}
