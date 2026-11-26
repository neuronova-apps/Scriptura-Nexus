"""P8.5.5 technical checkpoint. Never exports or authorizes corpus."""
import json,pathlib,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='01b0ed9ebbd16c96f43c1452e0966b3c4ca609d4'
TREE='c2d63a6fd4f001792f137f53a43b0356aa027ab5'
MANIFEST='docs/P8/cierre-tecnico-p85.json'
ADDITIONS=set(["docs/P8/cierre-tecnico-p85.json","docs/P8/27-cierre-tecnico-linguistico.md","scripts/validate-linguistic-closure-p85.py","tests/test_linguistic_closure_p85.py",".github/workflows/linguistic-closure.yml"])
def load(p):return json.loads((ROOT/p).read_text())
def require(ok,reason):
    if not ok:raise ValueError(reason)
def validate(m,review):
    require(m['schemaVersion']==1 and m['scope']=='P8.5.5-technical-checkpoint' and m['baseline']==BASE and m['baselineTree']==TREE,'identity')
    require(m['status']=='validacion_tecnica_pendiente_CI_y_aceptacion' and m['publication'] is False and m['fullCanon'] is False and m['formalAcceptance'] is None,'acceptance gate')
    require(review['publication'] is False and review['newAdmissions'] is False and review['authorization'] is None,'release review gate')
    e=m['coverageException']
    require(e['status']=='propuesta_pendiente_aceptacion' and e['admitted'] is False and e['candidates']==[x['id'] for x in review['expansion']] and e['directWordCandidates']==32416,'coverage gate')
    require(all(not x['allowedComponents'] and x['publication'] is False and x['importerCompatible'] is False for x in review['expansion']),'expansion gate')
    require(m['pending']==review['pending'] and m['releaseRequirements']==review['releaseRequirements'],'pending reconciliation')
    require(m['next']=='P9.1_planificacion_tras_aceptacion_tecnica_sin_publicacion','next gate')
    require([[x['phase'],x['pr'],x['merge'],x['runId'],x['runNumber']] for x in m['milestones']]==[["P8.1",29,"a69bf2b3ec736eda8705cfb22f652074e4388dd8",45832063851,88],["P8.2",36,"4cb3d4d67cf53abe86f447ffc040a8d5b5627d4d",45847935848,102],["P8.3",42,"07658a3740e85a5ff505fcfcd77a0ff257113f06",45863217439,119],["P8.4",49,"b0cf70833d2ba0e132d200d2add54070536f97c3",45876837207,137],["P8.5.1",50,"145290def901b3c1567828279715c426259a7b3c",45878628753,139],["P8.5.2",51,"ac9002ea65d14e35de6a11c730c198214bf55a76",45879240085,141],["P8.5.3",52,"caff8493318f9881bff140edf0f13c118270d317",45883363903,144],["P8.5.4",53,"01b0ed9ebbd16c96f43c1452e0966b3c4ca609d4",45887514502,146]] and all(x['conclusion']=='success' for x in m['milestones']),'milestones')
    require([[x['name'],x['runId'],x['jobId'],x['head']] for x in m['evidence']]==[["motor",45883577408,140128624302,"9f809502e373f0e07213f290a097fe405580b81c"],["indices",45883577364,140128624306,"9f809502e373f0e07213f290a097fe405580b81c"],["cobertura",45883577363,140128624248,"9f809502e373f0e07213f290a097fe405580b81c"],["analizador-navegador",45883577437,140128624395,"9f809502e373f0e07213f290a097fe405580b81c"],["lexicos-navegador",45883577496,140128624622,"9f809502e373f0e07213f290a097fe405580b81c"],["publicacion",45883577421,140128624621,"9f809502e373f0e07213f290a097fe405580b81c"],["integracion",45882445363,140124831764,"46b0498a47e07ae6d709d9e503bfab07ce7808f3"],["rendimiento",45882445256,140124831524,"46b0498a47e07ae6d709d9e503bfab07ce7808f3"]] and all(x['conclusion']=='success' for x in m['evidence']),'evidence')
    c=m['metrics']
    require(c['occurrences']==26750 and c['editions']==2 and c['books']==3 and c['units']==1905 and c['languageCounts']=={'hbo':22930,'arc':3601,'grc':219} and sum(c['languageCounts'].values())==c['occurrences'],'coverage')
    require(c['withLemma']==26156 and c['withoutLemma']==594 and c['withLemma']+c['withoutLemma']==c['occurrences'] and c['morphologyDocumented']==26411 and c['morphologyPending']==339 and c['morphologyDocumented']+c['morphologyPending']==c['occurrences'],'annotation coverage')
    require(c['morphologyPending']==sum(m['pending'][k] for k in ('morphologyPartial','morphologyUninterpreted','morphologyAbsent')) and c['withoutLemma']==m['pending']['withoutAdmittedLemma'],'pending counts')
    require(c['lexicalEntries']==30740 and c['lexicalForms']==10221 and c['definitions']==35496 and c['verifiedQueries']==41404 and c['postingsChecked']==158124 and c['frequencyScopes']==24,'index and lexical counts')
    require(c['admittedFiles']==len(review['existing'])==9 and c['incorporatedFiles']==sum(x['incorporatedInternally'] for x in review['existing'])==8 and c['publicRegistryEmpty'] is True,'admission coverage')
    require([c[k] for k in ('analyzerDigest','coverageDigest','indexDigest','lexicalDigest')]==["e34e5f2960ee117f79df4453645fa4a194862a49c80eb171756dc03f7e209189","5d9a10211b4c54777a43d9a7da663f49f99c8da009efbaf6d76ae24863ef7c6d","5f7181ebc6c7fc1e4832c87e6417eabe9d34c779937709323f3e6386e4a98c2d","26c8e8897f24c1991180cbbf0c0796afa130a6f6a088b1039cf69f137fe73f62"],'digests')
    a=m['accessibility']
    require(a=={'analyzerRealCases':8,'lexicalCases':8,'concordanceCases':15,'frequencyCases':9,'analyzerLayouts':24,'lexicalLayouts':24,'integrationLayouts':180,'analyzerAxe':4,'lexicalAxe':4,'integrationAxe':12,'navigation':8,'sectionLinks':5,'preferenceTransitions':3,'noJsNavigation':2,'manual':'pendiente'},'accessibility scope')
    p=m['performance'];b=p['budgets']
    require(b=={'jsBytes':153600,'homeTransferBytes':512000,'fragmentBytes':256000,'lcpMs':2500,'cls':0.1,'interactionMs':200},'budget definition')
    require(p['runId']==45882445256 and p['labRuns']==18 and p['responsesEqual'] is True and p['fieldINP']=='no_medido','performance scope')
    require([p[k] for k in ('homeJsBytes','homeTransferBytes','maxJsBytes','maxSampleFragmentBytes','maxLcpMs','maxCls','maxObservedInteractionMs','baselineP50ms','optimizedP50ms')]==[1209,9374,10720,10028,52,0,32,0.451,0.003],'performance evidence')
    require(p['maxJsBytes']<=b['jsBytes'] and p['homeTransferBytes']<=b['homeTransferBytes'] and p['maxSampleFragmentBytes']<=b['fragmentBytes'] and p['maxLcpMs']<=b['lcpMs'] and p['maxCls']<=b['cls'] and p['maxObservedInteractionMs']<=b['interactionMs'],'lab budgets')
def run(args,timeout=240):
    return subprocess.run(args,cwd=ROOT,check=True,capture_output=True,text=True,encoding='utf-8',timeout=timeout).stdout
def git(*args):return run(['git',*args],30)
def verify_tree():
    require(git('rev-parse',BASE+'^{tree}').strip()==TREE,'baseline tree')
    git('merge-base','--is-ancestor',BASE,'HEAD')
    diff=git('diff','--name-status','--no-renames',BASE,'HEAD').splitlines()
    require(set(diff)=={'A\t'+p for p in ADDITIONS},'scope diff')
    require(git('rev-parse','HEAD:src/data/linguistica/registro.json').strip()=='c56729ec8a3cea8aec04eca0b801a8a5b295cc4a','public registry blob')
    require(load('src/data/linguistica/registro.json')=={'schemaVersion':1,**{k:[] for k in ('editions','units','tokens','lemmas','identifiers','analyses','morphCodes')}},'public registry')
    # All baseline files, including app, studies, admissions, and historical test scripts,
    # are covered by the exact git diff check; no permission or source edits.
def verify_results(c,a,i,v,r):
    require(a['mode']=='P8.3.3-validation-only' and a['sha256']==c['analyzerDigest'] and a['occurrences']==c['occurrences'] and a['units']==c['units'] and a['languageCounts']==c['languageCounts'] and a['identifiers']==0 and a['published']==0 and a['publicRegistryEmpty'] is True,'motor regression')
    require(i['mode']=='P8.4.5-internal-only' and i['sha256']==c['indexDigest'] and i['verifiedQueries']==c['verifiedQueries'] and i['postingsChecked']==c['postingsChecked'] and i['frequencyScopes']==c['frequencyScopes'] and i['formEditionPostings']==i['formBookPostings']==c['occurrences'] and i['published']==i['persisted']==i['crossVersionLinks']==i['semanticEquivalences']==0,'index regression')
    require(v['mode']=='P8.5.1-coverage-only' and v['sha256']==c['coverageDigest'] and v['tokens']==c['occurrences'] and v['withLemma']==c['withLemma'] and v['withoutLemma']==c['withoutLemma'] and v['morphologyPending']['total']==c['morphologyPending'] and v['fullCanon'] is False and v['published']==0,'coverage regression')
    require(r['mode']=='P8.5.1-audit-only' and r['lexical']['sha256']==c['lexicalDigest'] and r['lexical']['entries']==c['lexicalEntries'] and r['lexical']['forms']==c['lexicalForms'] and r['lexical']['definitions']==c['definitions'] and r['published']==r['newAdmissions']==0,'lexical regression')
def main():
    stage='checkpoint'
    try:
        m=load(MANIFEST);validate(m,load('docs/P8/revision-publicacion-p85.json'));verify_tree()
        stage='motor';a=json.loads(run(['node','scripts/validate-term-analyzer.mjs']))
        stage='index';i=json.loads(run(['node','scripts/validate-concordance-index-p84.mjs']))
        stage='coverage';v=json.loads(run(['node','scripts/validate-linguistic-coverage-p85.mjs']))
        stage='lexical';r=json.loads(run(['python3','scripts/audit-linguistic-coverage-p85.py']))
        stage='reconciliation';verify_results(m['metrics'],a,i,v,r)
        stage='release';p=json.loads(run(['python3','scripts/review-linguistic-release-p85.py']))
        require(p['publicationAuthorized'] is False and p['newAdmissions']==0 and p['publicRegistryEmpty'] is True and p['licenseDocumentsVerified']==5 and p['pending']==m['pending'] and len(p['expansion'])==3 and all(x['admitted'] is False and x['importerAllows'] is False for x in p['expansion']) and sum(x['directWordCandidates'] for x in p['expansion'])==32416,'release regression')
        print(json.dumps({'mode':'P8.5.5-technical-checkpoint','baseline':BASE,'protectedBaseline':True,'historicalDeployments':len(m['milestones']),'historicalEvidence':len(m['evidence']),'reproducedChecks':5,'occurrences':a['occurrences'],'verifiedQueries':i['verifiedQueries'],'postingsChecked':i['postingsChecked'],'lexicalEntries':r['lexical']['entries'],'digestsMatch':True,'labBudgetsDocumented':True,'manualAccessibility':'pending','fieldINP':'not measured','coverageException':'pending acceptance','formalAcceptance':None,'publicRegistryEmpty':True,'published':0,'newAdmissions':0,'fullCanon':False},indent=2))
    except Exception as e:
        print('P8.5.5 failed at '+stage+' ('+type(e).__name__+'); source content omitted',file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())
