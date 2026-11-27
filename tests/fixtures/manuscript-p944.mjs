// Synthetic only. Never import into src or public.
export const marker='P944-PRIVATE-FIXTURE';
export function fixture(){
 const source=(id,title)=>({id,title,url:'https://example.invalid/'+id,rightsUrl:'https://example.invalid/terms',rights:'Reference only',attribution:'Synthetic source'});
 const ev=(id,sourceId,kind)=>({id,sourceId,kind,locator:'Synthetic locator '+id,reviewedOn:'2026-01-01'});
 return {publicationAuthorized:true,
 sources:[source('REC-p944-catalog','Synthetic catalog'),source('REC-p944-apparatus','Synthetic edition'),source('REC-p944-secondary','Synthetic report'),source('REC-p944-direct','Synthetic inspection')],
 evidence:[ev('EVD-p944-catalog','REC-p944-catalog','catalog'),ev('EVD-p944-apparatus','REC-p944-apparatus','editorial_apparatus'),ev('EVD-p944-secondary','REC-p944-secondary','secondary_report'),ev('EVD-p944-direct','REC-p944-direct','direct_inspection')],
 witnesses:[{id:'MAN-p944-fixture-A',name:'Códice sintético '+marker,catalogIdentifier:'Test A',dating:'Datación aproximada',language:'Griego',institution:'Custodia de prueba',shelfmark:null,evidenceIds:['EVD-p944-catalog']},{id:'MAN-p944-fixture-B',name:'Papiro sintético',catalogIdentifier:'Test B',dating:'Indeterminada',language:'Griego',institution:'Otra custodia',shelfmark:'Test 02',evidenceIds:['EVD-p944-catalog']}],
 variants:[{id:'VAR-p944-fixture',locus:'Locus sintético',edition:'Edición de prueba',apparatusEvidenceId:'EVD-p944-apparatus',assessment:'not_assessed',readings:[
 {id:'LEC-p944-A',reference:'Referencia <b>literal</b>',evidenceIds:['EVD-p944-apparatus','EVD-p944-secondary'],attestations:[{witnessId:'MAN-p944-fixture-A',evidenceId:'EVD-p944-secondary',basis:'secondary_report',locator:'Localizador reportado',hand:null}]},
 {id:'LEC-p944-B',reference:'Referencia B',evidenceIds:['EVD-p944-apparatus','EVD-p944-direct'],attestations:[{witnessId:'MAN-p944-fixture-B',evidenceId:'EVD-p944-direct',basis:'direct_inspection',locator:'Localizador sintético directo',hand:'Mano de prueba'}]},
 {id:'LEC-p944-C',reference:'Referencia C',evidenceIds:['EVD-p944-apparatus'],attestations:[]}
 ]}]};
}
