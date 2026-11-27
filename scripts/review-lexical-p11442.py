"""P11.4.4.2: verify proposed selectors; no new lexical admission."""
import collections
import csv
import hashlib
import importlib.util
import io
import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'docs/P11/registro-propuesta-lexica-p11442.json'
spec=importlib.util.spec_from_file_location('audit11441',ROOT/'scripts/audit-lexical-p11441.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
NS='{http://www.crosswire.org/2008/TEIOSIS/namespace}'
def require(ok,code):
    if not ok:raise ValueError(code)
def load():return json.loads(MANIFEST.read_text(encoding='utf-8'))
def validate(r):
    historical=p.load();m=p.validate(historical)
    require(r['phase']=='P11.4.4.2.propuesta_lexica_y_concordancias' and r['schemaVersion']==1 and r['baselineMain']=='87022b56867622f750146ea8c4cce1f33f44ab3f','phase')
    require(r['decision']==historical['decision'],'decision gate')
    require(r['proposal']['retained']==['LING-015','LING-016','LING-017','LING-018'] and r['proposal']['deferred']==['LEX-C01','LEX-C02','LEX-C07'],'scope')
    d=r['proposal']['candidate'];prior=historical['scope']['newCandidate']
    require(all(d[k]==prior[k] for k in ['id','repository','commit','path','bytes','gitBlobSha1','licenseEvidence','allowedComponents','publication']),'identity')
    require(d['sha256']=='39c6cb8053ef0adeffac7bbec1d1bc4f96c69424f8e6668f19b4244d3f234639' and d['review']=='propuesta_admision_tecnica_pendiente','hash or review')
    require(d['proposedComponents']==['identificadores_lexicos','anotaciones_lema','sentidos_lexicos'],'components')
    require(d['proposedSelectors']==['TEI/entry/@n','TEI/entry/orth/text()', "TEI/entry/def[@role='brief']/text()", "TEI/entry/def[@role='full']/text()"],'selectors')
    require(d['declaredLicense']=='CC0-1.0; dominio público declarado por proveedor' and 'Dodson' in d['attribution'],'rights')
    require(r['concordance']['publication'] is False and r['concordance']['occurrences']==historical['scope']['targetConcordance']['occurrences'],'concordance gate')
    return d,m
def inspect(b):
    s=b.decode('utf-8-sig',errors='strict');require(not re.search(r'<!\s*(?:DOCTYPE|ENTITY)',s,re.I),'unsafe xml')
    root=ET.fromstring(s);require(root.tag==NS+'TEI','root')
    keys=set();suffixes=collections.Counter();roles=collections.Counter();forms=collections.Counter();same=0;defs=0
    for e in root:
        require(e.tag==NS+'entry' and set(e.attrib)=={'n'},'entry')
        n=e.attrib['n'];match=re.fullmatch(r'(.+) \| ([0-9]{4})',n)
        require(match is not None and n not in keys,'key');keys.add(n);suffixes[match[2]]+=1
        children=list(e);require([c.tag for c in children]==[NS+'orth',NS+'def',NS+'def'],'children')
        orth=children[0];require(not orth.attrib and not len(orth) and bool(orth.text and orth.text.strip()) and bool(re.search(r'[\u0370-\u03ff\u1f00-\u1fff]',orth.text)),'orth')
        forms[orth.text]+=1;same+=match[1]==orth.text
        for c,role in zip(children[1:],['brief','full']):
            require(c.attrib=={'role':role} and not len(c) and bool(c.text and c.text.strip()),'definition')
            roles[role]+=1;defs+=1
    require(len(keys)>0,'empty')
    return {'entries':len(keys),'uniqueProviderKeys':len(keys),'forms':sum(forms.values()),'distinctExactForms':len(forms),'definitions':defs,'roles':dict(roles),'distinctNumericSuffixes':len(suffixes),'duplicateSuffixRows':len(keys)-len(suffixes),'labelEqualsOrth':same,'labelDiffersFromOrth':len(keys)-same},set(suffixes)
def run(r,fetch=p.audit.download):
    d,m=validate(r)
    for e in d['licenseEvidence']:
        b=fetch(d['repository'],d['commit'],e);p.audit.check_bytes(b,e)
    b=fetch(d['repository'],d['commit'],d);p.audit.check_bytes(b,d)
    stats,suffixes=inspect(b)
    require(stats['entries']==5410 and stats['forms']==5410 and stats['definitions']==10820 and stats['roles']=={'brief':5410,'full':5410} and stats['distinctNumericSuffixes']==5408,'baseline counts')
    csv_d=next(x for x in m['decisions'] if x['candidateId']=='LEX-C07')
    cb=fetch(csv_d['repository'],csv_d['commit'],csv_d);p.audit.check_bytes(cb,csv_d)
    rows=[x for x in csv.reader(io.StringIO(cb.decode('utf-8-sig')),delimiter='\t',strict=True) if x and any(x)]
    require(len(rows)==5409 and all(len(x)==5 for x in rows),'csv shape')
    # Numeric comparison is diagnostic only; not a mapping, merge, or equivalence.
    require(all(re.fullmatch(r'[0-9]{1,4}',x[0]) for x in rows[1:]),'csv labels')
    csv_keys={x[0].zfill(4) for x in rows[1:]}
    return {'phase':r['phase'],'candidate':d['id'],'sha256':d['sha256'],'statistics':stats,'csvRows':len(rows)-1,'numericLabelsOverlap':len(csv_keys&suffixes),'csvOnlyNumericLabels':len(csv_keys-suffixes),'xmlOnlyNumericLabels':len(suffixes-csv_keys),'lexicalMappingsCreated':0,'newAdmissions':0,'publicationAuthorized':False,'corpusPersisted':False}
if __name__=='__main__':
    try:print(json.dumps(run(load()),ensure_ascii=True,sort_keys=True))
    except Exception as e:
        print('P11.4.4.2 lexical proposal rejected ('+type(e).__name__+'); source content omitted',file=sys.stderr);sys.exit(1)
