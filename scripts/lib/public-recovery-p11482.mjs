import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,rmSync,cpSync,mkdtempSync,existsSync,realpathSync,statSync} from 'node:fs';
import {join,relative,isAbsolute,basename,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {snapshot} from './reader-artifact-scope.mjs';
import {inventoryPublicBaseline,comparePublicInventories} from './public-baseline-p11481.mjs';

export function validateRecoveryRecord(r,b,scope){
 assert.equal(r.schemaVersion,1);assert.equal(r.phase,'P11.4.8.2');
 assert.equal(r.previousEvidence.pr,129);assert.equal(r.previousEvidence.merge,r.baselineMain);
 assert.equal(r.previousEvidence.checksSuccess,60);assert.equal(r.previousEvidence.checksSkipped,1);
 const o=r.previousEvidence.observed;
 assert.equal(o.phase,b.phase);assert.equal(o.status,'public_baseline_verified_release_blocked');
 assert.ok(Number.isSafeInteger(o.files)&&o.files>0&&Number.isSafeInteger(o.bytes)&&o.bytes>0);
 assert.match(o.manifestSha256,/^[a-f0-9]{64}$/);
 assert.equal(o.rebuildIdentical,true);assert.equal(o.protectedObjects,Object.keys(b.protectedGitObjects).length);
 assert.equal(r.mode,'temporary_public_baseline_rehearsal');
 assert.deepEqual(r.planned,{incidents:['modified_file','missing_file','unexpected_file'],restorations:3,tamperedBackupRejected:true,gitRevertRehearsal:'temporary_local_artifact_repository',baselineIntact:true,temporaryCleanup:true});
 for(const k of ['publicationAuthorized','corpusImportAuthorized','releaseActionPerformed','upload']){assert.equal(r[k],false);assert.equal(o[k],false);}
 assert.equal(r.actualRollback,false);assert.equal(r.remoteGitWrites,false);assert.equal(r.publicModulesEnabled,0);assert.equal(o.publicModulesEnabled,0);
 assert.equal(r.manualPending,scope.manual.pending);assert.equal(o.manualPending,r.manualPending);
 assert.deepEqual(r.progress,b.progress);assert.equal(r.next,'P11.4.8.3');
}
export function verifyRecoveryCopy(root,expected){
 assert.deepEqual(snapshot(root),expected,'Recovery copy does not match verified baseline');
}
export function classifyIncident(expected,actual){
 const missing=[],modified=[],unexpected=[];
 for(const [p,d] of expected){if(!actual.has(p))missing.push(p);else if(actual.get(p)!==d)modified.push(p);}
 for(const p of actual.keys())if(!expected.has(p))unexpected.push(p);
 return {missing,modified,unexpected};
}
function checkedChild(temp,path,name){
 const t=realpathSync(temp),p=realpathSync(path);
 assert.ok(basename(t).startsWith('sn-public-recovery-')&&dirname(p)===t&&basename(p)===name);
 return p;
}
function restore(temp,backup,work,expected){
 const b=checkedChild(temp,backup,'backup'),w=checkedChild(temp,work,'work');
 assert.notEqual(b,w);verifyRecoveryCopy(b,expected);
 rmSync(w,{recursive:true,force:false});
 cpSync(b,w,{recursive:true,errorOnExist:true,force:false});
 verifyRecoveryCopy(w,expected);
}
function gitRevertRehearsal(temp,backup,expected){
 const repo=join(temp,'git-rehearsal');
 cpSync(backup,repo,{recursive:true,errorOnExist:true,force:false});checkedChild(temp,repo,'git-rehearsal');
 // A separate local repository contains only the already-public artifact. No remotes.
 const env={...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null',GIT_TERMINAL_PROMPT:'0'};
 for(const k of ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_CONFIG_COUNT','GIT_CONFIG_PARAMETERS'])delete env[k];
 const git=(...args)=>execFileSync('git',['-C',repo,'-c','user.name=Scriptura Recovery Test','-c','user.email=recovery@example.invalid','-c','commit.gpgsign=false','-c','core.autocrlf=false',...args],{encoding:'utf8',stdio:['ignore','pipe','pipe'],env}).trim();
 git('init','-q','--initial-branch=local-rehearsal');
 assert.equal(git('remote'), '');
 git('add','--all');git('commit','-qm','Verified public artifact');
 const first=git('rev-parse','HEAD');
 writeFileSync(join(repo,'index.html'),'Synthetic recovery incident\n');
 git('add','--','index.html');git('commit','-qm','Synthetic local incident');
 const incident=git('rev-parse','HEAD');assert.notEqual(incident,first);
 git('revert','--no-edit',incident);
 assert.equal(git('rev-parse','HEAD^{tree}'),git('rev-parse',first+'^{tree}'));
 assert.equal(git('status','--porcelain'),'');assert.equal(git('remote'),'');
 const exported=join(temp,'git-restored');cpSync(repo,exported,{recursive:true,filter:p=>basename(p)!=='.git'});
 verifyRecoveryCopy(exported,expected);
 return true;
}
export function rehearsePublicRecovery(root='dist'){
 const base=realpathSync(root),original=inventoryPublicBaseline(base),expected=snapshot(base);
 const temp=mkdtempSync(join(tmpdir(),'sn-public-recovery-'));
 const rel=relative(realpathSync(temp),base);assert.ok(rel&&(rel.startsWith('..')||isAbsolute(rel)));
 const backup=join(temp,'backup'),work=join(temp,'work');
 let result;
 try{
  cpSync(base,backup,{recursive:true,errorOnExist:true,force:false});cpSync(base,work,{recursive:true,errorOnExist:true,force:false});
  checkedChild(temp,backup,'backup');checkedChild(temp,work,'work');
  verifyRecoveryCopy(backup,expected);verifyRecoveryCopy(work,expected);
  const cases=[
   ['modified_file',()=>writeFileSync(join(work,'index.html'),'Synthetic recovery incident\n'),{missing:[],modified:['index.html'],unexpected:[]}],
   ['missing_file',()=>rmSync(join(work,'data/catalog-search.json')),{missing:['data/catalog-search.json'],modified:[],unexpected:[]}],
   ['unexpected_file',()=>writeFileSync(join(work,'unexpected-recovery-test.txt'),'Synthetic marker\n',{flag:'wx'}),{missing:[],modified:[],unexpected:['unexpected-recovery-test.txt']}]
  ];
  let restorations=0;
  for(const [name,mutate,diagnostic] of cases){
   mutate();assert.deepEqual(classifyIncident(expected,snapshot(work)),diagnostic,name);
   restore(temp,backup,work,expected);comparePublicInventories(original,inventoryPublicBaseline(work));restorations++;
  }
  const backupBytes=readFileSync(join(backup,'index.html'));
  writeFileSync(join(backup,'index.html'),'Synthetic damaged backup\n');
  const beforeRefusal=snapshot(work);
  assert.throws(()=>restore(temp,backup,work,expected));
  verifyRecoveryCopy(work,beforeRefusal);
  writeFileSync(join(backup,'index.html'),backupBytes);verifyRecoveryCopy(backup,expected);
  const gitRevertRehearsed=gitRevertRehearsal(temp,backup,expected);
  verifyRecoveryCopy(base,expected);verifyRecoveryCopy(backup,expected);
  result={incidents:cases.length,restorations,tamperedBackupRejected:true,gitRevertRehearsed,files:original.files,bytes:original.bytes,manifestSha256:original.sha256,baselineIntact:true};
 }finally{rmSync(temp,{recursive:true,force:true});}
 assert.equal(existsSync(temp),false);verifyRecoveryCopy(base,expected);
 return {...result,temporaryCleanup:true,actualRollback:false,remoteGitWrites:false};
}
