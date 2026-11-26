"""P8.5.4: release review only, no admission or corpus publication."""
import hashlib,importlib.util,json,pathlib,re,sys,collections,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(rel):return json.loads((ROOT/rel).read_text())
def module(name,rel):
    s=importlib.util.spec_from_file_location(name,ROOT/rel);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
coverage=module('coverage','scripts/audit-linguistic-coverage-p85.py')
parser=module('osis','scripts/lib/oshb-osis.py')
audit=coverage.audit
POLICY='docs/P8/revision-publicacion-p85.json'
HASHES=["5e53e6841562f2c7af6756984a643b05628b29c39dc690d914dce6c70c6c38cb","75a4a96e7b64f2145bede15ae37ac8a0b301f110d5d6b2daf9d8048adebbd2e6","f0104ad778bedd7cd67c7fa6529c0b157837fca140fd5a3594b5e44a28b5d474"]
REQUIREMENTS=["aprobacion_explicita_por_archivo_componente_y_version","atribucion_licencia_y_cambios_visibles","separar_texto_y_anotaciones_CC_BY_SA","proyeccion_reproducible_y_exclusion_de_componentes_no_admitidos","revision_manual_accesibilidad_y_presupuestos_o_excepcion_aprobada","verificacion_de_salida_publica_y_reversion"]
PENDING={"morphologyPartial":326,"morphologyUninterpreted":10,"morphologyAbsent":3,"withoutAdmittedLemma":594,"unresolvedStrongLinks":8,"unresolvedAugAttributes":1157,"greekLexicon":"no_disponible","TEHMC":"no_incorporada","manualAccessibility":"pendiente","fieldINP":"no_medido"}
def require(ok,reason):
    if not ok:raise ValueError(reason)
def sources():
    return [load('docs/P8/'+name) for name in ('candidatos-linguisticos.json','admision-griega.json','admision-lexica-p84.json','candidatos-ampliacion-p85.json')]
def validate(p,h,g,l,x):
    coverage.validate(x)
    require(p['schemaVersion']==1 and p['scope']=='P8.5.4-release-review-only' and p['publication'] is False and p['newAdmissions'] is False and p['authorization'] is None and p['baseline']=='caff8493318f9881bff140edf0f13c118270d317','release gate')
    require(g['publication'] is False and l['publication'] is False,'historical gate')
    old=[f for f in h['files']+g['files']+l['decisions'] if f['review']=='aprobado']
    require([f['id'] for f in old]==['LING-%03d'%i for i in range(10,19)],'admitted inventory')
    rows=[]
    for f in old:
        rows.append(dict(id=f['id'],repository=f['repository'],commit=f['commit'],path=f['path'],sha256=f['sha256'],bytes=f['bytes'],allowedComponents=f['allowedComponents'],selectors=f.get('selectors',[]),declaredLicense=f.get('declaredLicense',f.get('license')),attribution=f['attribution'],conditions=f['conditions'],incorporatedInternally=f['id']!='LING-010',publication=False,releaseStatus='pendiente_autorizacion'))
    require(p['existing']==rows and all(f['attribution'] and f['conditions'] and re.fullmatch('[a-f0-9]{64}',f['sha256']) for f in rows),'component inventory')
    require(rows[3]['allowedComponents']==['texto_griego'] and rows[4]['allowedComponents']==['anotaciones_lema','anotaciones_morfologia'] and rows[4]['declaredLicense']=='CC BY-SA 3.0','Greek separation')
    require(len(p['expansion'])==3,'expansion size')
    for i,(f,c) in enumerate(zip(p['expansion'],x['files'])):
        expected=dict(id=c['id'],book=c['book'],repository=x['repository'],commit=x['commit'],path=c['path'],bytes=c['bytes'],gitBlobSha1=c['gitBlobSha1'],sha256=HASHES[i],proposedComponents=c['proposedComponents'],allowedComponents=[],review='propuesto_no_admitido',publication=False,importerCompatible=False)
        require(f==expected,'candidate gate')
    require(p['deferred']==dict(historical=[f['id'] for f in h['files'] if f['review']!='aprobado'],greek=g['deferred'],lexical=[f['candidateId'] for f in l['decisions'] if f['review']=='aplazado']),'deferred inventory')
    require(p['releaseRequirements']==REQUIREMENTS and p['pending']==PENDING,'release conditions')
def preflight(b,book):
    result=coverage.stats(b,book)
    q=parser.q;root=ET.fromstring(b);d=root.find(q('osisText')).find(q('div'))
    chapters=d.findall(q('chapter'));verses=[v for ch in chapters for v in ch.findall(q('verse'))]
    words=[w for v in verses for w in v.findall(q('w')) if not len(w) and w.text and w.text.strip()]
    raw=result['rawWordElements']
    languages=collections.Counter('hbo' if re.match('^H[A-Za-z]',w.get('morph','')) else 'arc' if re.match('^A[A-Za-z]',w.get('morph','')) else 'unknown' for w in words)
    # Structural preview, not an import or an assertion of exact future token coverage.
    require(len(chapters)==result['chapters'] and len(verses)==result['verseElements'] and len(words)<=raw,'structural counts')
    require(all(any(w.text and w.text.strip() and not len(w) for w in v.findall(q('w'))) for v in verses),'empty direct verse')
    try:parser.parse(b,book)
    except ValueError as e:require(str(e)=='Libro no autorizado en P8.2.2','unexpected parser result')
    else:raise ValueError('unexpected importer permission')
    return dict(book=book,chapters=len(chapters),verses=len(verses),rawWordElements=raw,directWordCandidates=len(words),otherWordElements=raw-len(words),languageByMorphPrefix=dict(sorted(languages.items())),missingLemma=sum(not w.get('lemma') for w in words),missingMorph=sum(not w.get('morph') for w in words),importerAllows=False,admitted=False)
def main():
    stage='review'
    try:
        p=load(POLICY);h,g,l,x=sources();validate(p,h,g,l,x)
        registry=load('src/data/linguistica/registro.json')
        require(registry=={'schemaVersion':1,**{k:[] for k in ('editions','units','tokens','lemmas','identifiers','analyses','morphCodes')}},'public registry')
        stage='license evidence'
        # Reverify five distinct fixed license documents; data/license hashes are separate.
        step=l['decisions'][0]['licenseEvidence'][0]
        evidence=[(h['files'][9]['repository'],h['files'][9]['commit'],step,'STEP'),(x['repository'],x['commit'],x['licenseEvidence'],'OSHB'),(g['files'][0]['repository'],g['files'][0]['commit'],g['files'][0]['licenseEvidence'],'SBLGNT'),(g['files'][1]['repository'],g['files'][1]['commit'],g['files'][1]['licenseEvidence'],'MorphGNT'),(l['decisions'][2]['repository'],l['decisions'][2]['commit'],l['decisions'][2]['licenseEvidence'][0],'HebrewLexicon')]
        for repo,rev,f,name in evidence:
            stage='license '+name
            raw=audit.download(repo,rev,f);audit.check_bytes(raw,f)
            s=raw.decode('utf-8-sig').lower()
            if name=='OSHB':require('public domain' in s and 'cc by 4.0' in s,'license terms')
            elif name=='MorphGNT':require('creativecommons.org/licenses/by-sa/3.0' in s and 'sblgnt eula' in s,'license terms')
            elif name=='SBLGNT':require('attribution 4.0 international' in s,'license terms')
            elif name=='HebrewLexicon':require('creativecommons.org/licenses/by/4.0' in s and 'public domain' in s,'license terms')
            else:require('creativecommons.org/licenses/by/4.0' in s or 'cc by 4.0' in s,'license terms')
        stage='expansion'
        candidates=[]
        for f in p['expansion']:
            stage=f['id']
            b=audit.download(f['repository'],f['commit'],f);sha=audit.check_bytes(b,f);require(sha==f['sha256'],'sha256 mismatch')
            candidates.append(dict(id=f['id'],sha256=sha,**preflight(b,f['book'])))
        print(json.dumps({'mode':'P8.5.4-review-only','existingInternalAdmissions':len(p['existing']),'licenseDocumentsVerified':len(evidence),'expansion':candidates,'newAdmissions':0,'publicationAuthorized':False,'publicRegistryEmpty':True,'pending':p['pending']},indent=2,sort_keys=True))
    except Exception as e:
        known={'release gate','historical gate','admitted inventory','component inventory','Greek separation','expansion size','candidate gate','deferred inventory','release conditions','public registry','license terms','structural counts','empty direct verse','unexpected parser result','unexpected importer permission','sha256 mismatch','blob mismatch'}
        print('P8.5.4 failed at '+stage+' ('+(str(e) if str(e) in known else type(e).__name__)+'); content omitted',file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())
