import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const tokens=['VAR-P943-JHN-1-18','LEC-P943-','REC-P943-','EVD-P943-','MAN-GA-P66','MAN-GA-02','muestra-manuscritos-p943','reference_only_pilot'];
let files=0;
function scan(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    if(entry.isDirectory()){scan(path);continue;}
    for(const token of tokens) assert.ok(!path.includes(token),'Registro piloto en ruta pública: '+path);
    if(!/\.(?:html|js|mjs|css|json|xml|txt|map|svg)$/i.test(path)) continue;
    const content=readFileSync(path,'utf8');
    for(const token of tokens) assert.ok(!content.includes(token),'Registro piloto en artefacto: '+path);
    files++;
  }
}
scan('dist');
assert.ok(files>0,'Build vacío');
console.log('P9.4.3: '+files+' archivos públicos de texto sin registros de la muestra.');
