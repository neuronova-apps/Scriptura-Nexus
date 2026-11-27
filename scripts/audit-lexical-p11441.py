"""P11.4.4.1: audit metadata only; no new admissions or corpus persistence."""
import collections
import hashlib
import importlib.util
import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT=pathlib.Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'docs/P11/registro-auditoria-lexica-p11441.json'
def module(name,filename):
    spec=importlib.util.spec_from_file_location(name,ROOT/'scripts'/filename)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
review=module('lex_review','review-lexicon-admission-p84.py')
audit=review.audit
FIELDS=['candidateId','id','repository','commit','path','bytes','gitBlobSha1','sha256','license','licenseEvidence','allowedComponents','selectors','conditions','review','publication']
EXPECTED_NEW={'id':'LEX-C08','repository':'biblicalhumanities/Dodson-Greek-Lexicon','commit':'74f70358d4acfaf2f980bf2feb58ab7115cbbcbc','path':'dodson.xml','bytes':1315372,'gitBlobSha1':'93bdd519bb68db9a4f2969d50d31ee42b2372e06','sha256':None,'allowedComponents':[],'review':'auditoria_sin_admision','publication':False}
def require(ok,code):
    if not ok:raise ValueError(code)
def load():
    return json.loads(MANIFEST.read_text(encoding='utf-8'))
def validate(r):
    prior=json.loads(audit.MANIFEST.read_text(encoding='utf-8'))
    m=json.loads(review.MANIFEST.read_text(encoding='utf-8'))
    admitted=review.verified_decisions(m,prior)
    require(r['schemaVersion']==1 and r['phase']=='P11.4.4.1.auditoria_lexica','phase')
    require(r['baselineMain']=='20b10235a0e7a19799dfff78715816260e4c4399' and r['previousIntegration']['pr']==107,'baseline')
    require(r['analyzer']=={'technicalPreparation':'completada','publicationAuthorized':False,'manualReview':'pendiente','separateDecision':True,'chapters':168,'occurrences':78218},'analyzer gate')
    scope=r['scope']
    require(scope['existingLexicalFiles']==[{k:d[k] for k in FIELDS} for d in m['decisions']],'historical scope')
    require([d['id'] for d in admitted]==['LING-015','LING-016','LING-017','LING-018'],'admitted scope')
    require(scope['newCandidate']==dict(EXPECTED_NEW,licenseEvidence=m['decisions'][-1]['licenseEvidence']),'new candidate')
    require(scope['historicalModel']=={'entries':30740,'forms':10221,'definitions':35496,'occurrences':26750},'baseline model')
    require(scope['targetConcordance']=={'books':7,'chapters':168,'units':5162,'occurrences':78218,'publication':False,'implementation':'pendiente'},'target scope')
    require(r['decision']=={'newAdmissions':0,'publicationAuthorized':False,'automaticCorpusLinks':False,'semanticEquivalences':False,'translateDefinitions':False,'corpusPersisted':False},'decision gate')
    require(r['progress']=={'completed':61,'total':69},'progress')
    pub=json.loads((ROOT/'src/data/linguistica/registro.json').read_text(encoding='utf-8'))
    require(pub=={'schemaVersion':1,'editions':[],'units':[],'tokens':[],'lemmas':[],'identifiers':[],'analyses':[],'morphCodes':[]},'public gate')
    return m
def xml_inventory(b):
    s=b.decode('utf-8-sig',errors='strict')
    require(not re.search(r'<!\s*(?:DOCTYPE|ENTITY)',s,re.I),'unsafe xml')
    root=ET.fromstring(s)
    tags=collections.Counter();attrs=collections.Counter();unicode_nodes=0;elements=0;max_depth=0
    stack=[(root,0)]
    while stack:
        e,depth=stack.pop();elements+=1;max_depth=max(max_depth,depth)
        tag=audit.local(e.tag)
        require(bool(re.fullmatch(r'[A-Za-z_][A-Za-z0-9_.-]{0,79}',tag)),'unexpected tag')
        tags[tag]+=1
        for k in e.attrib:
            name=audit.local(k)
            require(bool(re.fullmatch(r'[A-Za-z_][A-Za-z0-9_.-]{0,79}',name)),'unexpected attribute')
            attrs[name]+=1
        if re.search(r'[\u0370-\u03ff\u1f00-\u1fff]',e.text or ''):unicode_nodes+=1
        stack.extend((c,depth+1) for c in e)
        require(elements<=200000 and depth<=64,'xml budget')
    require(elements>1,'empty xml')
    return {'root':audit.local(root.tag),'elements':elements,'maxDepth':max_depth,'tagCounts':dict(sorted(tags.items())),'attributeCounts':dict(sorted(attrs.items())),'greekUnicodeTextNodes':unicode_nodes}
def run(r,fetch=audit.download):
    m=validate(r);cache={}
    def get(d,item):
        k=(d['repository'],d['commit'],item['path'])
        if k not in cache:cache[k]=fetch(d['repository'],d['commit'],item)
        b=cache[k];audit.check_bytes(b,item);return b
    results=[]
    prior=json.loads(audit.MANIFEST.read_text(encoding='utf-8'))
    formats={f['id']:f['format'] for f in prior['files']}
    for d in m['decisions']:
        for e in d['licenseEvidence']:get(d,e)
        b=get(d,d);fmt=formats[d['candidateId']]
        stats=audit.xml_stats(b.decode('utf-8-sig'),fmt) if fmt.startswith('xml-') else audit.table_stats(b.decode('utf-8-sig'),fmt)
        results.append({'id':d['candidateId'],'sha256':hashlib.sha256(b).hexdigest(),'statistics':stats,'historicalAdmission':d['id'],'publication':False})
    new=r['scope']['newCandidate']
    for e in new['licenseEvidence']:get(new,e)
    b=get(new,new);stats=xml_inventory(b)
    return {'phase':r['phase'],'historicalCandidates':7,'admittedInternal':4,'deferredHistorical':3,'newAuditCandidates':1,'licenseEvidenceFiles':len(cache)-8,'results':results,'newCandidate':{'id':new['id'],'bytes':len(b),'gitBlobSha1':new['gitBlobSha1'],'sha256':hashlib.sha256(b).hexdigest(),'statistics':stats,'admitted':False},'newAdmissions':0,'publicationAuthorized':False,'corpusPersisted':False}
if __name__=='__main__':
    try:print(json.dumps(run(load()),ensure_ascii=True,sort_keys=True))
    except Exception as e:
        print('P11.4.4.1 audit rejected ('+type(e).__name__+'); source content omitted',file=sys.stderr)
        sys.exit(1)
