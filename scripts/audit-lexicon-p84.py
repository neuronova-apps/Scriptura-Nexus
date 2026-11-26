"""P8.4.1: reproducible metadata-only audit of fixed lexical candidates."""
import collections
import csv
import io
import hashlib
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT=pathlib.Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'docs/P8/candidatos-lexicos-p84.json'
ALLOWED={'STEPBible/STEPBible-Data','openscriptures/HebrewLexicon','biblicalhumanities/Dodson-Greek-Lexicon'}
MAX_BYTES=6*1024*1024
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):
        raise ValueError('redirect prohibited')
def valid_path(p):
    return isinstance(p,str) and bool(p) and not re.search(r'[\\?#:\x00-\x1f]',p) and all(x not in ('','.','..') for x in p.split('/'))
def validate(m):
    if m.get('schemaVersion')!=1 or m.get('scope')!='P8.4.1-audit-only' or m.get('publication') is not False or m.get('admission') is not False:
        raise ValueError('audit gate')
    fs=m['files']
    if len(fs)!=7 or {f['id'] for f in fs}!={f'LEX-C{i:02d}' for i in range(1,8)}:
        raise ValueError('candidate inventory')
    for f in fs:
        if f['repository'] not in ALLOWED or not re.fullmatch('[a-f0-9]{40}',f['commit']) or f['allowedComponents']!=[] or f['publication'] is not False or f['review'] not in ('revision_por_componentes','prioritario_para_propuesta') or not f['licenseEvidence']:
            raise ValueError('candidate scope')
        for item in [f,*f['licenseEvidence']]:
            if not valid_path(item['path']) or not isinstance(item['bytes'],int) or not 0<item['bytes']<=MAX_BYTES or not re.fullmatch('[a-f0-9]{40}',item['gitBlobSha1']):
                raise ValueError('file metadata')
            if item['sha256'] is not None and not re.fullmatch('[a-f0-9]{64}',item['sha256']):
                raise ValueError('sha256')
    return fs
def check_bytes(b,f):
    if len(b)!=f['bytes'] or hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()!=f['gitBlobSha1']:
        raise ValueError('blob mismatch')
    sha=hashlib.sha256(b).hexdigest()
    if f['sha256'] is not None and sha!=f['sha256']:
        raise ValueError('sha256 mismatch')
    b.decode('utf-8-sig',errors='strict')
    return sha
def download(repository,commit,f):
    url='https://raw.githubusercontent.com/'+repository+'/'+commit+'/'+urllib.parse.quote(f['path'],safe='/')
    req=urllib.request.Request(url,headers={'User-Agent':'Scriptura-Nexus-P84-Audit','Accept-Encoding':'identity'})
    with urllib.request.build_opener(NoRedirect()).open(req,timeout=90) as r:
        if r.geturl()!=url or r.status!=200:
            raise ValueError('unexpected response')
        b=r.read(f['bytes']+1)
    check_bytes(b,f)
    return b
def local(tag): return tag.rsplit('}',1)[-1]
def xml_stats(s,kind):
    if re.search(r'<!\s*(?:DOCTYPE|ENTITY)',s,re.I):
        raise ValueError('unsafe xml')
    root=ET.fromstring(s)
    counts=collections.Counter(local(e.tag) for e in root.iter())
    if kind=='xml-aug':
        rows=[e for e in root.iter() if local(e.tag)=='w' and 'aug' in e.attrib]
        if not rows: raise ValueError('missing augmented index')
        keys=[e.attrib['aug'] for e in rows]
        return {'root':local(root.tag),'rows':len(rows),'uniqueKeys':len(set(keys)),'duplicateRows':len(rows)-len(set(keys)),'emptyTargets':sum(not (e.text or '').strip() for e in rows)}
    entries=[e for e in root.iter() if local(e.tag)=='entry']
    if not entries: raise ValueError('missing entries')
    if kind=='xml-index':
        langs=collections.Counter()
        for part in root.iter():
            if local(part.tag)=='part':
                code=part.attrib.get('{http://www.w3.org/XML/1998/namespace}lang','unknown')
                langs[code if code in ('heb','arc','hbo','he','ar') else 'other']+=sum(local(e.tag)=='entry' for e in part)
        xrefs=[e for e in root.iter() if local(e.tag)=='xref']
        return {'root':local(root.tag),'entries':len(entries),'languages':dict(sorted(langs.items())),'xrefStrong':sum('strong' in e.attrib for e in xrefs),'xrefBDB':sum('bdb' in e.attrib for e in xrefs),'xrefTWOT':sum('twot' in e.attrib for e in xrefs),'wordElements':counts['w']}
    return {'root':local(root.tag),'entries':len(entries),'entriesWithId':sum('id' in e.attrib for e in entries),'wordElements':counts['w']}
def table_stats(s,kind):
    lines=s.splitlines()
    if kind=='step-tsv':
        # Discover table structure from the fixed file; do not presume TBESH and
        # TBESG share identical headings. An unrecognized header is a finding,
        # never permission to use the fields.
        data_positions=[i for i,line in enumerate(lines) if re.match(r'^\s*[HG]\d{1,5}(?:\s|[A-Za-z=])',line) and '\t' in line]
        if not data_positions: raise ValueError('no STEP data rows')
        before=lines[:data_positions[0]]
        candidates=[line.split('\t') for line in before if '\t' in line and re.search(r'\b(?:eStrong|Strong)\b',line,re.I) and re.search(r'\b(?:Meaning|Definition|Gloss)\b',line,re.I)]
        fields=candidates[-1] if candidates else []
        header='\n'.join(before).lower()
        rows=[lines[i].split('\t') for i in data_positions]
        recognized=bool(fields)
        known_labels={'estrong','dstrong','ustrong','strong','hebrew','greek','transliteration','morph','gloss','meaning','definition'}
        labels=[re.sub(r'[^a-z]','',f.strip().lower()) for f in fields]
        return {'headerRecognized':recognized,'headerColumns':len(fields) if recognized else None,'knownHeaderLabels':[f for f in labels if f in known_labels],'requiresHeaderReview':not recognized,'dataRows':len(rows),'rowWidths':dict(sorted(collections.Counter(len(r) for r in rows).items())),'headerSignals':{'onlineBible':'online bible' in header,'permission':'permission' in header,'abbottSmith':'abbott' in header,'liddell':'liddell' in header,'ccBy':'cc by' in header or 'cc-by' in header,'gloss':'gloss' in header,'meaning':'meaning' in header}}
    rows=list(csv.reader(io.StringIO(s),delimiter='\t',strict=True))
    rows=[r for r in rows if r and any(r)]
    expected=["Strong's","Goodrick-Kohlenberger","Greek Word","English Definition (brief)","English Definition (longer)"]
    if not rows or rows[0]!=expected: raise ValueError('unexpected Dodson CSV header')
    data=rows[1:]
    if not data: raise ValueError('no Dodson data rows')
    return {'dataRows':len(data),'headerColumns':len(rows[0]),'rowWidths':dict(sorted(collections.Counter(len(r) for r in data).items())),'numericStrongRows':sum(bool(re.fullmatch(r'\d{1,5}',r[0])) for r in data),'uniqueStrongKeys':len({r[0] for r in data}),'greekUnicodeRows':sum(len(r)>2 and bool(re.search(r'[\u0370-\u03ff\u1f00-\u1fff]',r[2])) for r in data),'format':'quoted TSV, five documented-by-file columns; Greek encoding requires separate validation'}

def audit(m,fetch=download):
    fs=validate(m)
    cache={}
    def get(f,item):
        key=(f['repository'],f['commit'],item['path'])
        if key not in cache: cache[key]=fetch(f['repository'],f['commit'],item)
        b=cache[key]
        return b,check_bytes(b,item)
    results=[]
    for f in fs:
        print('Audit candidate '+f['id'],file=sys.stderr)
        b,sha=get(f,f)
        evidence=[]
        for e in f['licenseEvidence']:
            _,h=get(f,e)
            evidence.append({'path':e['path'],'bytes':e['bytes'],'sha256':h})
        s=b.decode('utf-8-sig')
        stats=xml_stats(s,f['format']) if f['format'].startswith('xml-') else table_stats(s,f['format'])
        results.append({'id':f['id'],'bytes':len(b),'sha256':sha,'licenseEvidence':evidence,'statistics':stats,'admitted':False})
    return {'mode':'P8.4.1-audit-only','candidates':len(results),'uniqueEvidenceFiles':len({(f['repository'],e['path']) for f in fs for e in f['licenseEvidence']}),'results':results,'admitted':0,'published':0}
def main():
    stage='manifest'
    try:
        m=json.loads(MANIFEST.read_text(encoding='utf-8'))
        stage='registry'
        public=json.loads((ROOT/'src/data/linguistica/registro.json').read_text(encoding='utf-8'))
        if public.get('schemaVersion')!=1 or any(public.get(k)!=[] for k in ('editions','units','tokens','lemmas','identifiers','analyses','morphCodes')): raise ValueError('public registry changed')
        stage='audit'
        report=audit(m)
        print(json.dumps(report,ensure_ascii=True,sort_keys=True,indent=2))
    except Exception as e:
        allowed={'audit gate','candidate inventory','candidate scope','file metadata','sha256','blob mismatch','sha256 mismatch','redirect prohibited','unexpected response','unsafe xml','missing augmented index','missing entries','missing STEP header','no STEP data rows','unexpected Dodson CSV header','no Dodson data rows','public registry changed'}
        detail=str(e) if str(e) in allowed else type(e).__name__
        print('P8.4.1 audit failed at '+stage+' ('+detail+'); source content omitted',file=sys.stderr)
        return 1
    return 0
if __name__=='__main__': sys.exit(main())
