"""P11.4.3.1. Audit fixed priority sources in memory; aggregate results only."""
import collections,hashlib,importlib.util,json,pathlib,re,sys,urllib.parse,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(name):
    spec=importlib.util.spec_from_file_location(name.replace('-','_'),ROOT/'scripts'/name)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
p91=load('audit-editions-p91.py')
oshb=load('audit-linguistic-coverage-p85.py')
greek=load('audit-greek-p83.py')
MANIFEST=ROOT/'docs/P11/registro-auditoria-linguistica-p11431.json'
def require(ok,msg):
    if not ok:raise ValueError(msg)
def validate(plan):
    expected=json.loads("{\"schemaVersion\":1,\"phase\":\"P11.4.3.1\",\"baselineMain\":\"4b6bbc611ae3c6fabb54b36d29bbb2ee3ed5c122\",\"priorReader\":{\"pr\":98,\"status\":\"pendiente_integracion_y_publicacion\",\"parallelDevelopmentRequested\":true,\"mobileL05\":\"pendiente_aplazada\"},\"historical\":[{\"path\":\"docs/P11/registro-seleccion-funcional-p1141.json\",\"blob\":\"43d971ae286a979c3d58a0c2f475cd219e112024\"},{\"path\":\"docs/P8/revision-publicacion-p85.json\",\"blob\":\"30c2c3d5719eefd08ae059bfbe37ce1958b961cc\"},{\"path\":\"docs/P8/cierre-tecnico-p85.json\",\"blob\":\"8cbc260841d54bb95d227e7f64b320769542f7d0\"},{\"path\":\"docs/P8/candidatos-ampliacion-p85.json\",\"blob\":\"bd6f6d03a872a76b7f890eff48bb4e6a6cb1a659\"},{\"path\":\"docs/P8/admision-griega.json\",\"blob\":\"15a0d6ebf079f4335b2892a735ee7cd5e7bed354\"},{\"path\":\"docs/P10/registro-validacion-hebreo-p1031.json\",\"blob\":\"a48d2971e19e04b2c68d11fb818afa15f8b4e3ce\"},{\"path\":\"docs/P10/registro-validacion-griego-p1032.json\",\"blob\":\"e529ff7ec45a1901ab30e64244724c30ba8c94ff\"},{\"path\":\"docs/P9/admisiones-ediciones-p912.json\",\"blob\":\"ed258f7067315a91814fb8f222af696ed9d0d303\"}],\"baseline\":{\"books\":3,\"units\":1905,\"occurrences\":26750,\"withLemma\":26156},\"existing\":[{\"id\":\"LING-010\",\"license\":\"CC BY 4.0 (declaración general; confirmar cabecera y componentes)\",\"components\":[\"codigo_morfologico\",\"descripcion_gramatical\"],\"incorporatedInternally\":false,\"publication\":false,\"route\":\"condicional\"},{\"id\":\"LING-011\",\"license\":\"WLC dominio público según proveedor; anotaciones CC BY 4.0\",\"components\":[\"texto_wlc\",\"anotaciones_lema\",\"anotaciones_morfologia\"],\"incorporatedInternally\":true,\"publication\":false,\"route\":\"P11.4.3\"},{\"id\":\"LING-012\",\"license\":\"WLC dominio público según proveedor; anotaciones CC BY 4.0\",\"components\":[\"texto_wlc\",\"anotaciones_lema\",\"anotaciones_morfologia\"],\"incorporatedInternally\":true,\"publication\":false,\"route\":\"P11.4.3\"},{\"id\":\"LING-013\",\"license\":\"CC BY 4.0\",\"components\":[\"texto_griego\"],\"incorporatedInternally\":true,\"publication\":false,\"route\":\"P11.4.3\"},{\"id\":\"LING-014\",\"license\":\"CC BY-SA 3.0\",\"components\":[\"anotaciones_lema\",\"anotaciones_morfologia\"],\"incorporatedInternally\":true,\"publication\":false,\"route\":\"P11.4.3\"},{\"id\":\"LING-015\",\"license\":\"CC BY 4.0\",\"components\":[\"identificadores_lexicos\"],\"incorporatedInternally\":true,\"publication\":false,\"route\":\"P11.4.4\"},{\"id\":\"LING-016\",\"license\":\"CC BY 4.0\",\"components\":[\"anotaciones_lema\",\"identificadores_lexicos\"],\"incorporatedInternally\":true,\"publication\":false,\"route\":\"P11.4.4\"},{\"id\":\"LING-017\",\"license\":\"CC BY 4.0\",\"components\":[\"identificadores_lexicos\",\"sentidos_lexicos\"],\"incorporatedInternally\":true,\"publication\":false,\"route\":\"P11.4.4\"},{\"id\":\"LING-018\",\"license\":\"CC BY 4.0\",\"components\":[\"identificadores_lexicos\",\"sentidos_lexicos\"],\"incorporatedInternally\":true,\"publication\":false,\"route\":\"P11.4.4\"}],\"sources\":[{\"key\":\"OSHB\",\"repository\":\"openscriptures/morphhb\",\"commit\":\"6a5db284c715c18b239422e57bb89684e6a19f00\",\"licenseEvidence\":{\"path\":\"LICENSE.md\",\"bytes\":1476,\"gitBlobSha1\":\"906e051438bf66ef6f2f7f36110504cba2b6867f\",\"sha256\":\"9bf4a2890c25372e4c1dc750d550bfb4eacfbfcb63c53123b0628159370d1878\"},\"conditions\":\"WLC declarado dominio público; anotaciones CC BY 4.0; preservar atribución y capas.\"},{\"key\":\"SBLGNT\",\"repository\":\"Faithlife/SBLGNT\",\"commit\":\"736fdc76158950c3d04b949b7e013ca14305145a\",\"licenseEvidence\":{\"path\":\"LICENSE\",\"bytes\":18650,\"gitBlobSha1\":\"2f244ac814036ecd9ba9f69782e89ce6b1dca9eb\",\"sha256\":\"7e7170e3cebf88a9f60c7b8421418323c09304da1af4d5e90f4da1dc1c8a2661\"},\"conditions\":\"CC BY 4.0; texto oficial, atribución y cambios.\"},{\"key\":\"MorphGNT\",\"repository\":\"morphgnt/sblgnt\",\"commit\":\"aaed91e57c8e4a8dc9a2383e129ca5e75fe6393d\",\"licenseEvidence\":{\"path\":\"README.md\",\"bytes\":1630,\"gitBlobSha1\":\"a3256051467a61ddb5099254dd9abaf5d03e5e80\",\"sha256\":\"043bb6c0d654e85fa8a8db19e177ee035623e23b7ff1556e5431ad95184d5830\"},\"conditions\":\"CC BY-SA 3.0 para anotaciones; atribución y compartir igual; excluir columnas textuales de la proyección.\"}],\"candidates\":[{\"id\":\"P1143-H01\",\"book\":\"Lev\",\"source\":\"OSHB\",\"path\":\"wlc/Lev.xml\",\"bytes\":1085069,\"gitBlobSha1\":\"6025e0713ccfc79de0c90cb92ed0e8c0062d2614\",\"sha256\":null,\"componentsProposed\":[\"texto_wlc\",\"anotaciones_lema\",\"anotaciones_morfologia\"],\"admitted\":false},{\"id\":\"P1143-H02\",\"book\":\"Deut\",\"source\":\"OSHB\",\"path\":\"wlc/Deut.xml\",\"bytes\":1315401,\"gitBlobSha1\":\"5317431fd1d1fb5848d7f9f1d22d0753152f9991\",\"sha256\":null,\"componentsProposed\":[\"texto_wlc\",\"anotaciones_lema\",\"anotaciones_morfologia\"],\"admitted\":false},{\"id\":\"P1143-G01\",\"book\":\"Acts\",\"source\":\"SBLGNT\",\"path\":\"data/sblgnt/xml/Acts.xml\",\"bytes\":921255,\"gitBlobSha1\":\"168d2faff82b0047805703dfe1892e5655c211c8\",\"sha256\":\"5040d5a8570ce8f391209f228707c560e83fccc439f364d0a8baf89666025ea3\",\"componentsProposed\":[\"texto_griego\"],\"admitted\":false,\"providerBookId\":\"Ac\",\"referenceBookLabel\":\"Acts\",\"expectedWords\":18412,\"expectedVerses\":1002},{\"id\":\"P1143-G02\",\"book\":\"Acts\",\"source\":\"MorphGNT\",\"path\":\"65-Ac-morphgnt.txt\",\"bytes\":1228900,\"gitBlobSha1\":\"3aed8e1a1dd9d77b4c448a0893bd4ddee6eb6842\",\"sha256\":null,\"componentsProposed\":[\"anotaciones_lema\",\"anotaciones_morfologia\"],\"admitted\":false,\"bookCode\":\"05\"},{\"id\":\"P1143-G03\",\"book\":\"1Cor\",\"source\":\"SBLGNT\",\"path\":\"data/sblgnt/xml/1Cor.xml\",\"bytes\":342330,\"gitBlobSha1\":\"2a0c1a309626f498d6ce76626385d9c2dbf83acd\",\"sha256\":\"5a12d44dd6a9c7c236da21dc85a1d60915c54c988c59ba456f27bf528da1812b\",\"componentsProposed\":[\"texto_griego\"],\"admitted\":false,\"providerBookId\":\"1Co\",\"referenceBookLabel\":\"1 Corinthians\",\"expectedWords\":6812,\"expectedVerses\":437},{\"id\":\"P1143-G04\",\"book\":\"1Cor\",\"source\":\"MorphGNT\",\"path\":\"67-1Co-morphgnt.txt\",\"bytes\":435113,\"gitBlobSha1\":\"28dec6618da3a378f454b6c72776286855857920\",\"sha256\":null,\"componentsProposed\":[\"anotaciones_lema\",\"anotaciones_morfologia\"],\"admitted\":false,\"bookCode\":\"07\"}],\"pilotReferences\":[{\"study\":\"SN-001\",\"book\":\"Lev\",\"chapter\":\"19\",\"verse\":\"28\"},{\"study\":\"SN-001\",\"book\":\"Deut\",\"chapter\":\"14\",\"verse\":\"1\"},{\"study\":\"SN-008\",\"book\":\"Acts\",\"chapter\":\"2\",\"verse\":\"4\"},{\"study\":\"SN-008\",\"book\":\"Acts\",\"chapter\":\"10\",\"verse\":\"46\"},{\"study\":\"SN-008\",\"book\":\"Acts\",\"chapter\":\"19\",\"verse\":\"6\"},{\"study\":\"SN-008\",\"book\":\"1Cor\",\"chapter\":\"12\",\"verse\":\"10\"},{\"study\":\"SN-008\",\"book\":\"1Cor\",\"chapter\":\"13\",\"verse\":\"8\"},{\"study\":\"SN-008\",\"book\":\"1Cor\",\"chapter\":\"14\",\"verse\":\"2\"}],\"deferredBooks\":[\"Exod\",\"Ezra\"],\"policy\":{\"auditOnly\":true,\"requireExactReferencePositionForm\":true,\"withholdUnequalVerseLength\":true,\"excludeNotesAndVariants\":true,\"sourceNativeReferences\":true,\"noStrongInference\":true,\"noSemanticInference\":true},\"publicationAuthorized\":false,\"newAdmissionAuthorized\":false,\"progress\":{\"completed\":61,\"total\":69},\"next\":\"P11.4.3.2_decision_por_componente_tras_auditoria\"}")
    require(plan==expected,'audit scope')
    for f in plan['historical']:
        raw=(ROOT/f['path']).read_bytes().replace(b'\r\n',b'\n')
        require(p91.blob(raw)==f['blob'],'historical fingerprint')
    reg=json.loads((ROOT/'src/data/linguistica/registro.json').read_bytes())
    require(reg=={'schemaVersion':1,**{k:[] for k in ['editions','units','tokens','lemmas','identifiers','analyses','morphCodes']}},'public registry')
def fixed(source,meta,fetch=p91.fetch):
    url='https://raw.githubusercontent.com/'+source['repository']+'/'+source['commit']+'/'+urllib.parse.quote(meta['path'],safe='/')
    data=fetch(url,meta['bytes'])
    require(len(data)==meta['bytes'] and p91.blob(data)==meta['gitBlobSha1'],'source identity')
    digest=p91.sha(data)
    if meta.get('sha256'):require(digest==meta['sha256'],'source sha256')
    return data,digest
def hebrew(data,book):
    metrics=oshb.stats(data,book)
    root=ET.fromstring(data)
    ns=oshb.NS
    refs={}
    for v in root.iter(ns+'verse'):
        ref=v.get('osisID','').split('.')
        require(len(ref)==3 and ref[0]==book,'Hebrew reference')
        key=tuple(ref[1:])
        require(key not in refs,'duplicate reference')
        words=v.findall(ns+'w')
        refs[key]={'directWords':len(words),'withLemmaAttribute':sum(bool(w.get('lemma')) for w in words),'withMorphAttribute':sum(bool(w.get('morph')) for w in words)}
    metrics['directWords']=sum(v['directWords'] for v in refs.values())
    return metrics,refs
def official(data,meta):
    metrics=p91.greek(data)
    require(metrics['providerBookId']==meta['providerBookId'] and metrics['referenceBookLabel']==meta['referenceBookLabel'] and metrics['wordElements']==meta['expectedWords'] and metrics['verseMarkers']==meta['expectedVerses'],'official Greek scope')
    refs={};key=None
    for node in greek.xml_root(data).iter():
        if node.tag=='verse-number':
            label=node.get('id','')
            m=re.fullmatch(re.escape(meta['referenceBookLabel'])+r' (\d+):(\d+[a-z]?(?:[-–]\d+[a-z]?)?)',label)
            require(m is not None,'Greek reference')
            key=(m[1],m[2]);require(key not in refs,'duplicate reference');refs[key]=[]
        elif node.tag=='w':
            require(key is not None and node.text and greek.GREEK.search(node.text),'Greek word')
            refs[key].append(node.text)
    return metrics,refs
def morph(data,book_code):
    refs=collections.defaultdict(list)
    for line in data.decode('utf-8',errors='strict').splitlines():
        if not line.strip():continue
        f=line.split()
        require(len(f)==7 and re.fullmatch(re.escape(book_code)+r'\d{4}',f[0]) and re.fullmatch(r'[A-Z][A-Z-]',f[1]) and re.fullmatch(r'[A-Z1-3-]{8}',f[2]) and greek.GREEK.search(f[4]) and greek.GREEK.search(f[6]),'MorphGNT schema')
        key=(str(int(f[0][2:4])),str(int(f[0][4:6])))
        refs[key].append(f[4])
    require(bool(refs),'empty morphology')
    return dict(refs)
def compare(official_refs,morph_refs):
    result={}
    for key,words in official_refs.items():
        candidate=morph_refs.get(key,[])
        equal_length=key in morph_refs and len(words)==len(candidate)
        exact=sum(a==b for a,b in zip(words,candidate)) if equal_length else 0
        result[key]={'officialWords':len(words),'morphWords':len(candidate),'equalLength':equal_length,'eligibleExact':exact,'withheld':len(words)-exact}
    metrics={'officialWords':sum(len(v) for v in official_refs.values()),'morphWords':sum(len(v) for v in morph_refs.values()),'eligibleExact':sum(v['eligibleExact'] for v in result.values()),'withheld':sum(v['withheld'] for v in result.values()),'differentLengthOrMissingVerses':sum(not v['equalLength'] for v in result.values()),'candidateOnlyVerses':len(set(morph_refs)-set(official_refs))}
    return metrics,result
def audit(plan,fetch=p91.fetch):
    validate(plan)
    sources={x['key']:x for x in plan['sources']}
    licenses=[]
    for source in sources.values():
        _,digest=fixed(source,source['licenseEvidence'],fetch)
        licenses.append({'source':source['key'],'sha256':digest,'verified':True})
    rows=[];refs={};text_refs={}
    for meta in plan['candidates']:
        data,digest=fixed(sources[meta['source']],meta,fetch)
        row={'id':meta['id'],'book':meta['book'],'source':meta['source'],'sha256':digest,'bytes':len(data),'admitted':False}
        if meta['source']=='OSHB':
            row['metrics'],refs[meta['book']]=hebrew(data,meta['book'])
        elif meta['source']=='SBLGNT':
            row['metrics'],text_refs[meta['book']]=official(data,meta)
        else:
            row['metrics'],refs[meta['book']]=compare(text_refs[meta['book']],morph(data,meta['bookCode']))
        rows.append(row)
    cases=[]
    for c in plan['pilotReferences']:
        v=refs[c['book']].get((c['chapter'],c['verse']))
        require(v is not None,'pilot reference absent')
        cases.append({**c,'audit':v,'analysisCompleted':False})
    return {'phase':plan['phase'],'licenses':licenses,'files':rows,'pilotReferences':cases,'newAdmissions':0,'publicationAuthorized':False,'corpusPersisted':False}
if __name__=='__main__':
    try:
        result=audit(json.loads(MANIFEST.read_bytes()))
        print(json.dumps(result,ensure_ascii=False,sort_keys=True))
    except Exception as exc:
        # Never emit source content, traceback with words, or corpus.
        safe={'audit scope','historical fingerprint','public registry','source identity','source sha256','Hebrew reference','duplicate reference','official Greek scope','Greek reference','Greek word','MorphGNT schema','empty morphology','pilot reference absent'}
        print('P11.4.3.1 audit failed: '+(str(exc) if str(exc) in safe else type(exc).__name__),file=sys.stderr);sys.exit(1)
