"""Private structural projection of fixed audited candidates; never admit or publish."""
import hashlib,importlib.util,json,pathlib,sys,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(path,name):
    spec=importlib.util.spec_from_file_location(name,ROOT/path);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
a=load('scripts/audit-linguistic-priority-p11431.py','audit_p11431')
osis=load('scripts/lib/oshb-osis.py','osis_p11432')
MANIFEST=ROOT/'docs/P11/registro-propuesta-ampliacion-linguistica-p11432.json'
def require(ok,msg):
    if not ok:raise ValueError(msg)
def canonical(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def validate(r):
    expected=json.loads("{\"schemaVersion\":1,\"phase\":\"P11.4.3.2.preparacion\",\"baselineMain\":\"99ff0283fbbbf5bb52787e8ac33184e32b68480f\",\"auditBlob\":\"c85ec9d9b6847dfbc5987cabb64528eac6651dbd\",\"previousIntegration\":{\"pr\":99,\"workflows\":25,\"run\":46018749734,\"job\":140572572345,\"merge\":\"99ff0283fbbbf5bb52787e8ac33184e32b68480f\",\"readerArtifactPR\":98,\"readerArtifactMerge\":\"b19edc852dc510fea9c1e2bd13156202322c6e63\",\"pagesRun\":46019506753,\"pagesAtPreparation\":\"success\"},\"audit\":{\"corpusPersisted\":false,\"files\":[{\"admitted\":false,\"book\":\"Lev\",\"bytes\":1085069,\"id\":\"P1143-H01\",\"metrics\":{\"chapters\":27,\"directWords\":11950,\"noteElements\":52,\"rawWordElements\":11955,\"rawWordsWithLemmaAttribute\":11955,\"rawWordsWithMorphAttribute\":11955,\"rightsVerified\":true,\"verseElements\":859},\"sha256\":\"75a4a96e7b64f2145bede15ae37ac8a0b301f110d5d6b2daf9d8048adebbd2e6\",\"source\":\"OSHB\"},{\"admitted\":false,\"book\":\"Deut\",\"bytes\":1315401,\"id\":\"P1143-H02\",\"metrics\":{\"chapters\":34,\"directWords\":14294,\"noteElements\":274,\"rawWordElements\":14320,\"rawWordsWithLemmaAttribute\":14320,\"rawWordsWithMorphAttribute\":14320,\"rightsVerified\":true,\"verseElements\":959},\"sha256\":\"aad16a6a2dcbdc6ee36d7d051e80a63bfeb69ecaae19f775ec5b6aa67fe22355\",\"source\":\"OSHB\"},{\"admitted\":false,\"book\":\"Acts\",\"bytes\":921255,\"id\":\"P1143-G01\",\"metrics\":{\"chapters\":28,\"emptyVerseMarkers\":0,\"prefixElements\":1088,\"providerBookId\":\"Ac\",\"referenceBookLabel\":\"Acts\",\"suffixElements\":18412,\"verseMarkers\":1002,\"wordElements\":18412},\"sha256\":\"5040d5a8570ce8f391209f228707c560e83fccc439f364d0a8baf89666025ea3\",\"source\":\"SBLGNT\"},{\"admitted\":false,\"book\":\"Acts\",\"bytes\":1228900,\"id\":\"P1143-G02\",\"metrics\":{\"candidateOnlyVerses\":0,\"differentLengthOrMissingVerses\":0,\"eligibleExact\":18272,\"morphWords\":18412,\"officialWords\":18412,\"withheld\":140},\"sha256\":\"04349afeba263d667698b37d39465d746530434b455fb6ac2941ec5c59fb85ca\",\"source\":\"MorphGNT\"},{\"admitted\":false,\"book\":\"1Cor\",\"bytes\":342330,\"id\":\"P1143-G03\",\"metrics\":{\"chapters\":16,\"emptyVerseMarkers\":0,\"prefixElements\":336,\"providerBookId\":\"1Co\",\"referenceBookLabel\":\"1 Corinthians\",\"suffixElements\":6812,\"verseMarkers\":437,\"wordElements\":6812},\"sha256\":\"5a12d44dd6a9c7c236da21dc85a1d60915c54c988c59ba456f27bf528da1812b\",\"source\":\"SBLGNT\"},{\"admitted\":false,\"book\":\"1Cor\",\"bytes\":435113,\"id\":\"P1143-G04\",\"metrics\":{\"candidateOnlyVerses\":0,\"differentLengthOrMissingVerses\":0,\"eligibleExact\":6754,\"morphWords\":6812,\"officialWords\":6812,\"withheld\":58},\"sha256\":\"5233a5b099e2499baed34ec2d6f53ae44545d532a7e2fb12acafcf39ff6fdbf3\",\"source\":\"MorphGNT\"}],\"licenses\":[{\"sha256\":\"9bf4a2890c25372e4c1dc750d550bfb4eacfbfcb63c53123b0628159370d1878\",\"source\":\"OSHB\",\"verified\":true},{\"sha256\":\"7e7170e3cebf88a9f60c7b8421418323c09304da1af4d5e90f4da1dc1c8a2661\",\"source\":\"SBLGNT\",\"verified\":true},{\"sha256\":\"043bb6c0d654e85fa8a8db19e177ee035623e23b7ff1556e5431ad95184d5830\",\"source\":\"MorphGNT\",\"verified\":true}],\"newAdmissions\":0,\"phase\":\"P11.4.3.1\",\"pilotReferences\":[{\"analysisCompleted\":false,\"audit\":{\"directWords\":12,\"withLemmaAttribute\":12,\"withMorphAttribute\":12},\"book\":\"Lev\",\"chapter\":\"19\",\"study\":\"SN-001\",\"verse\":\"28\"},{\"analysisCompleted\":false,\"audit\":{\"directWords\":12,\"withLemmaAttribute\":12,\"withMorphAttribute\":12},\"book\":\"Deut\",\"chapter\":\"14\",\"study\":\"SN-001\",\"verse\":\"1\"},{\"analysisCompleted\":false,\"audit\":{\"eligibleExact\":16,\"equalLength\":true,\"morphWords\":16,\"officialWords\":16,\"withheld\":0},\"book\":\"Acts\",\"chapter\":\"2\",\"study\":\"SN-008\",\"verse\":\"4\"},{\"analysisCompleted\":false,\"audit\":{\"eligibleExact\":12,\"equalLength\":true,\"morphWords\":12,\"officialWords\":12,\"withheld\":0},\"book\":\"Acts\",\"chapter\":\"10\",\"study\":\"SN-008\",\"verse\":\"46\"},{\"analysisCompleted\":false,\"audit\":{\"eligibleExact\":17,\"equalLength\":true,\"morphWords\":18,\"officialWords\":18,\"withheld\":1},\"book\":\"Acts\",\"chapter\":\"19\",\"study\":\"SN-008\",\"verse\":\"6\"},{\"analysisCompleted\":false,\"audit\":{\"eligibleExact\":14,\"equalLength\":true,\"morphWords\":14,\"officialWords\":14,\"withheld\":0},\"book\":\"1Cor\",\"chapter\":\"12\",\"study\":\"SN-008\",\"verse\":\"10\"},{\"analysisCompleted\":false,\"audit\":{\"eligibleExact\":14,\"equalLength\":true,\"morphWords\":14,\"officialWords\":14,\"withheld\":0},\"book\":\"1Cor\",\"chapter\":\"13\",\"study\":\"SN-008\",\"verse\":\"8\"},{\"analysisCompleted\":false,\"audit\":{\"eligibleExact\":16,\"equalLength\":true,\"morphWords\":16,\"officialWords\":16,\"withheld\":0},\"book\":\"1Cor\",\"chapter\":\"14\",\"study\":\"SN-008\",\"verse\":\"2\"}],\"publicationAuthorized\":false},\"proposedFiles\":[{\"id\":\"P1143-H01\",\"book\":\"Lev\",\"source\":\"OSHB\",\"path\":\"wlc/Lev.xml\",\"sha256\":\"75a4a96e7b64f2145bede15ae37ac8a0b301f110d5d6b2daf9d8048adebbd2e6\",\"components\":[\"texto_wlc\",\"anotaciones_lema\",\"anotaciones_morfologia\"],\"decision\":\"pendiente_aprobacion_especifica\",\"publication\":false},{\"id\":\"P1143-H02\",\"book\":\"Deut\",\"source\":\"OSHB\",\"path\":\"wlc/Deut.xml\",\"sha256\":\"aad16a6a2dcbdc6ee36d7d051e80a63bfeb69ecaae19f775ec5b6aa67fe22355\",\"components\":[\"texto_wlc\",\"anotaciones_lema\",\"anotaciones_morfologia\"],\"decision\":\"pendiente_aprobacion_especifica\",\"publication\":false},{\"id\":\"P1143-G01\",\"book\":\"Acts\",\"source\":\"SBLGNT\",\"path\":\"data/sblgnt/xml/Acts.xml\",\"sha256\":\"5040d5a8570ce8f391209f228707c560e83fccc439f364d0a8baf89666025ea3\",\"components\":[\"texto_griego\"],\"decision\":\"pendiente_aprobacion_especifica\",\"publication\":false},{\"id\":\"P1143-G02\",\"book\":\"Acts\",\"source\":\"MorphGNT\",\"path\":\"65-Ac-morphgnt.txt\",\"sha256\":\"04349afeba263d667698b37d39465d746530434b455fb6ac2941ec5c59fb85ca\",\"components\":[\"anotaciones_lema\",\"anotaciones_morfologia\"],\"decision\":\"pendiente_aprobacion_especifica\",\"publication\":false},{\"id\":\"P1143-G03\",\"book\":\"1Cor\",\"source\":\"SBLGNT\",\"path\":\"data/sblgnt/xml/1Cor.xml\",\"sha256\":\"5a12d44dd6a9c7c236da21dc85a1d60915c54c988c59ba456f27bf528da1812b\",\"components\":[\"texto_griego\"],\"decision\":\"pendiente_aprobacion_especifica\",\"publication\":false},{\"id\":\"P1143-G04\",\"book\":\"1Cor\",\"source\":\"MorphGNT\",\"path\":\"67-1Co-morphgnt.txt\",\"sha256\":\"5233a5b099e2499baed34ec2d6f53ae44545d532a7e2fb12acafcf39ff6fdbf3\",\"components\":[\"anotaciones_lema\",\"anotaciones_morfologia\"],\"decision\":\"pendiente_aprobacion_especifica\",\"publication\":false}],\"scope\":{\"primaryOnly\":true,\"excludeAlternatives\":true,\"keepRawProviderCodes\":true,\"greekExactPositionForm\":true,\"separateGreekAnnotations\":true,\"greekWithheld\":198,\"maximumCandidateOccurrences\":51468,\"potentialTotalOccurrences\":78218,\"existingBooks\":3,\"priorityBooks\":4},\"newAdmissionAuthorized\":false,\"publicationAuthorized\":false,\"progress\":{\"completed\":61,\"total\":69},\"next\":\"aprobacion_por_componente_e_integracion_analizador\"}")
    require(r==expected,'proposal scope')
    raw=a.MANIFEST.read_bytes().replace(b'\r\n',b'\n')
    require(a.p91.blob(raw)==r['auditBlob'],'audit provenance')
    plan=json.loads(raw);a.validate(plan)
    return plan
def hebrew_projection(data,book,expected):
    require(book in ('Lev','Deut'),'Hebrew scope')
    projection=osis._parse_primary(data,book)
    primary=[];unknown=0;lemma=0;morph=0
    for ch in projection['chapters']:
        for v in ch['verses']:
            for e in v['events']:
                if e['kind']!='word':continue
                loc=v['reference']
                raw=e['morphRaw'] or ''
                language='hbo' if raw.startswith('H') else 'arc' if raw.startswith('A') else None
                unknown+=language is None;lemma+=e['lemmaRaw'] is not None;morph+=e['morphRaw'] is not None
                primary.append({'ref':loc,'form':e['form'],'lemmaRaw':e['lemmaRaw'],'morphRaw':e['morphRaw'],'language':language})
    require(len(projection['chapters'])==expected['chapters'] and sum(len(c['verses']) for c in projection['chapters'])==expected['verseElements'] and len(primary)==expected['directWords'],'OSIS coverage')
    return {'primaryWords':len(primary),'unknownLanguage':unknown,'lemmaAttributes':lemma,'morphAttributes':morph,'sha256':a.p91.sha(canonical(primary)),'alternativesIncluded':False}
def greek_layers(official,body,book_code):
    forms=a.morph(body,book_code)
    annotations=collections.defaultdict(list)
    for line in body.decode('utf8').splitlines():
        if not line.strip():continue
        f=line.split();key=(str(int(f[0][2:4])),str(int(f[0][4:6])))
        annotations[key].append({'pos':f[1],'parsing':f[2],'lemma':f[6]})
    require(set(forms)==set(annotations),'Greek annotation keys')
    text=[];ann=[]
    for ref,words in official.items():
        match=ref in forms and len(words)==len(forms[ref])
        for i,word in enumerate(words):
            key={'chapter':ref[0],'verse':ref[1],'position':i+1}
            text.append({**key,'form':word})
            if match and word==forms[ref][i]:ann.append({**key,**annotations[ref][i]})
    return text,ann
def prepare(r,fetch=a.p91.fetch):
    plan=validate(r);sources={x['key']:x for x in plan['sources']};expected={x['id']:x for x in r['audit']['files']}
    # Check the license evidence and file identity again; use pinned SHA-256 on every file.
    for src in sources.values():a.fixed(src,src['licenseEvidence'],fetch)
    heb=[];greek=[];official={}
    for meta in plan['candidates']:
        evidence=expected[meta['id']]
        body,digest=a.fixed(sources[meta['source']],{**meta,'sha256':evidence['sha256']},fetch)
        if meta['source']=='OSHB':
            heb.append({'book':meta['book'],**hebrew_projection(body,meta['book'],evidence['metrics'])})
        elif meta['source']=='SBLGNT':
            _,official[meta['book']]=a.official(body,meta)
        else:
            text,ann=greek_layers(official[meta['book']],body,meta['bookCode'])
            require(len(text)==evidence['metrics']['officialWords'] and len(ann)==evidence['metrics']['eligibleExact'] and len(text)-len(ann)==evidence['metrics']['withheld'],'Greek coverage')
            greek.append({'book':meta['book'],'officialWords':len(text),'eligibleAnnotations':len(ann),'withheld':len(text)-len(ann),'textSha256':a.p91.sha(canonical(text)),'annotationSha256':a.p91.sha(canonical(ann)),'separateLayers':True})
    require(sum(x['primaryWords'] for x in heb)+sum(x['officialWords'] for x in greek)==51468 and sum(x['withheld'] for x in greek)==198,'candidate totals')
    return {'phase':r['phase'],'hebrew':heb,'greek':greek,'candidateOccurrences':51468,'newAdmissions':0,'publicationAuthorized':False,'corpusPersisted':False}
if __name__=='__main__':
    try:print(json.dumps(prepare(json.loads(MANIFEST.read_bytes())),ensure_ascii=False,sort_keys=True))
    except Exception as e:
        safe={'proposal scope','audit provenance','Hebrew scope','OSIS coverage','Greek annotation keys','Greek coverage','candidate totals'}
        print('P11.4.3.2 preparation failed ('+(str(e) if str(e) in safe else type(e).__name__)+')',file=sys.stderr);sys.exit(1)
