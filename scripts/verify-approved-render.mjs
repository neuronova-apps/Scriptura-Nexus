import {mkdtempSync,cpSync,symlinkSync,readFileSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {fixture,approve,ctx} from '../tests/fixtures/p6-template.mjs';
const root=mkdtempSync(join(tmpdir(),'sn-editorial-test-'));
try{
 for(const path of ['src','public','package.json','astro.config.mjs','tsconfig.json'])if(existsSync(path))cpSync(path,join(root,path),{recursive:true});
 symlinkSync(resolve('node_modules'),join(root,'node_modules'),'dir');
 const s=fixture();s.bodies['SN-001/S01']='PRUEBA SINTÉTICA P6.5.5 <script>no ejecutar</script>';
 const omitted=s.record.sections[7];omitted.applicability='no_aplicable';omitted.justification='PRUEBA SINTÉTICA P6.5.5 omisión';delete omitted.contentRef;delete s.bodies[omitted.id];
 writeFileSync(join(root,'src/data/publicaciones/registro.json'),JSON.stringify({schemaVersion:1,snapshots:[approve(s)]}));
 const registry=join(root,'src/lib/publication-registry.ts');
 const original=readFileSync(registry,'utf8');
 // Replace only the context in the isolated copy; retain all production rendering and validation.
 const injected=original.replace(/const context:PublicationContext=.*?;\n/, 'const context:PublicationContext='+JSON.stringify(ctx)+';\n');
 assert.notEqual(injected,original);writeFileSync(registry,injected);
 execFileSync('npm',['run','build'],{cwd:root,stdio:'inherit'});
 const html=readFileSync(join(root,'dist/estudios/SN-001/index.html'),'utf8');
 assert.match(html,/Investigación aprobada/);assert.match(html,/Versión aprobada: 1\.0\.0/);
 assert.match(html,/Contenido revisado de la versión aprobada/);
 assert.doesNotMatch(html,/Investigación planificada\. No se ha publicado|no equivale a publicación aprobada|Pendientes de consulta y verificación/);
 assert.equal((html.match(/class="study-approved-body"/g)||[]).length,19);
 assert.match(html,/data-section-state="no_aplicable"/);assert.match(html,/PRUEBA SINTÉTICA P6\.5\.5 omisión/);
 assert.match(html,/id="rel-AF-900001"/);assert.match(html,/href="#rel-EVD-900001"/);
 assert.match(html,/&lt;script/);assert.doesNotMatch(html,/<script>no ejecutar/);
 const pending=readFileSync(join(root,'dist/estudios/SN-002/index.html'),'utf8');assert.match(pending,/Sin versión aprobada/);assert.doesNotMatch(pending,/PRUEBA SINTÉTICA/);
 assert.doesNotMatch(readFileSync('dist/estudios/SN-001/index.html','utf8'),/PRUEBA SINTÉTICA/);
 console.log('Render positivo aislado, omisión, escape y ficha pendiente conformes.');
}finally{rmSync(root,{recursive:true,force:true});}
