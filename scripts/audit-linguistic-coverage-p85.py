"""P8.5.1: reproduce lexical coverage and audit additional OSHB files; metadata only."""
import collections,importlib.util,json,pathlib,re,sys,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('model',ROOT/'scripts/project-lexical-model-p84.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
audit=m.admission.audit
NS='{http://www.bibletechnologies.net/2003/OSIS/namespace}'
MANIFEST=ROOT/'docs/P8/candidatos-ampliacion-p85.json'
REPO='openscriptures/morphhb'
REV='6a5db284c715c18b239422e57bb89684e6a19f00'
PINNED=[["wlc/Exod.xml",1524392,"9f1174a401696a1625e88c0d87ed2359889fb79e"],["wlc/Lev.xml",1085069,"6025e0713ccfc79de0c90cb92ed0e8c0062d2614"],["wlc/Ezra.xml",369920,"03b112205f559c24d00e35109f950c42e3f9464b"]]
def check(ok,reason):
    if not ok:raise ValueError(reason)
def validate(c):
    check(c['schemaVersion']==1 and c['scope']=='P8.5.1-audit-only' and c['repository']==REPO and c['commit']==REV and c['publication'] is False and c['admission'] is False,'scope')
    check([[f['path'],f['bytes'],f['gitBlobSha1']] for f in c['files']]==PINNED,'pinned candidates')
    check(all(f['review']=='pendiente' and f['allowedComponents']==[] and f['book']==f['path'][4:-4] and f['sha256'] is None and f['proposedComponents']==['texto_wlc','anotaciones_lema','anotaciones_morfologia'] for f in c['files']),'candidate gate')
    check(c['licenseEvidence']=={'path':'LICENSE.md','bytes':1476,'gitBlobSha1':'906e051438bf66ef6f2f7f36110504cba2b6867f','sha256':'9bf4a2890c25372e4c1dc750d550bfb4eacfbfcb63c53123b0628159370d1878'},'license evidence')
def stats(b,book):
    s=b.decode('utf-8-sig')
    check(not re.search(r'<!\s*(?:DOCTYPE|ENTITY)',s,re.I),'unsafe XML')
    root=ET.fromstring(s);check(root.tag==NS+'osis','OSIS')
    text=root.find(NS+'osisText');check(text is not None and text.get('osisIDWork')=='OSHB','work')
    header=text.find(NS+'header');check(header is not None,'header')
    rights={w.get('osisWork'):[''.join(x.itertext()).strip() for x in w.findall(NS+'rights')] for w in header.findall(NS+'work')}
    check(any('Creative Commons Attribution 4.0' in x for x in rights.get('OSHB',[])) and any('Public Domain' in x for x in rights.get('WLC',[])),'rights')
    divs=[e for e in text.iter(NS+'div') if e.get('type')=='book']
    check(len(divs)==1 and divs[0].get('osisID')==book,'book identity')
    d=divs[0];chapters=list(d.iter(NS+'chapter'));verses=list(d.iter(NS+'verse'))
    # These are raw structural counts, including all w elements within notes.
    # Not primary-token coverage and not a future admission/import.
    words=list(d.iter(NS+'w'))
    chapter_ids=[e.get('osisID') for e in chapters];verse_ids=[e.get('osisID') for e in verses]
    check(all(x and x.startswith(book+'.') for x in chapter_ids+verse_ids) and len(set(chapter_ids))==len(chapter_ids) and len(set(verse_ids))==len(verse_ids),'references')
    check(bool(words) and bool(verses),'empty book')
    return {'chapters':len(chapters),'verseElements':len(verses),'rawWordElements':len(words),'rawWordsWithLemmaAttribute':sum(bool(w.get('lemma')) for w in words),'rawWordsWithMorphAttribute':sum(bool(w.get('morph')) for w in words),'noteElements':len(list(d.iter(NS+'note'))),'rightsVerified':True}
def main():
    stage='manifest'
    try:
        c=json.loads(MANIFEST.read_text());validate(c)
        stage='license'
        lic=audit.download(REPO,REV,c['licenseEvidence']);audit.check_bytes(lic,c['licenseEvidence'])
        candidates=[]
        for f in c['files']:
            stage=f['id'];b=audit.download(REPO,REV,f);sha=audit.check_bytes(b,f)
            candidates.append({'id':f['id'],'book':f['book'],'sha256':sha,'bytes':len(b),**stats(b,f['book']),'admitted':False})
        stage='lexical'
        roots,ds,_=m.load_verified();model=m.project(roots,ds,True);m.validate_model(model,ds,True)
        check(m.digest(model)=='26c8e8897f24c1991180cbbf0c0796afa130a6f6a088b1039cf69f137fe73f62','lexical digest')
        links={k:dict(collections.Counter(l['state'] for l in model['links'] if l['kind']==k)) for k in sorted({l['kind'] for l in model['links']})}
        check(links['index-strong']=={'documentado':9291,'sin_resolver':8} and links['index-aug-attribute']=={'sin_resolver':1157},'lexical pending')
        check(len(model['entries'])==30740 and len(model['definitions'])==35496,'lexical counts')
        print(json.dumps({'mode':'P8.5.1-audit-only','lexical':{'entries':len(model['entries']),'forms':len(model['forms']),'definitions':len(model['definitions']),'links':links,'sha256':m.digest(model)},'expansionCandidates':candidates,'newAdmissions':0,'published':0},sort_keys=True,indent=2))
    except Exception as e:
        allowed={'scope','pinned candidates','candidate gate','license evidence','unsafe XML','OSIS','work','header','rights','book identity','references','empty book','lexical digest','lexical pending','lexical counts','blob mismatch','sha256 mismatch'}
        print('P8.5.1 failed at '+stage+' ('+(str(e) if str(e) in allowed else type(e).__name__)+'); source content omitted',file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())
