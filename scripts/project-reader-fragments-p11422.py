"""P11.4.2.2: chapter fragments, in memory only. Never print or persist corpus."""
import gzip, hashlib, importlib.util, json, pathlib, re, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
p=load('p913_fragments','scripts/project-textual-p913.py')
FORMAT='sn-reader-chapter-v1'
MAX_GZIP=256000
EXPECTED={'editions':2,'bookFiles':93,'chapters':1449,'units':39041,'emptyMarkers':18}
def require(condition,message):
    if not condition: raise ValueError(message)
def git_blob(data):
    # Match Git's text clean-filter behavior when core.autocrlf=true on Windows.
    canonical=data.replace(b'\r\n',b'\n')
    return hashlib.sha1(b'blob '+str(len(canonical)).encode()+b'\0'+canonical).hexdigest()
def check_plan():
    r=json.loads((ROOT/'docs/P11/registro-proyeccion-lector-p11422.json').read_bytes())
    rights=(ROOT/'docs/P11/registro-permisos-lector-p11421.json').read_bytes()
    projection=(ROOT/'docs/P9/proyeccion-ediciones-p913.json').read_bytes()
    require(git_blob(rights)==r['rightsBlob']=='3c6d1d783a2b95fce49c5f3d5cd5c112c0e5c67b','rights provenance')
    require(git_blob(projection)==r['projectionBlob']=='ff6ef60588416089b26afcc6160df74956b496df','projection provenance')
    require(r['schemaVersion']==1 and r['phase']=='P11.4.2.2' and r['baselineMain']=='7e83e45521eca6cfe49532ad0aebe0fa4e294c8a','phase')
    require(r['previousIntegration']=={'pr':88,'workflowRun':45950758581,'job':140345796907,'successfulWorkflows':20,'deployRun':45987196868,'deploy':'pending_confirmation'},'integration')
    require(r['mode']=='in_memory_only' and r['format']==FORMAT and r['fragmentKey']==['editionId','bookId','chapter'],'format')
    require(r['encoding']=='UTF-8 JSON canonical (sorted keys, compact, unescaped Unicode)' and r['integrity']=='SHA-256 of canonical JSON bytes','encoding')
    require(r['compression']=={'algorithm':'gzip','level':6,'mtime':0,'maxBytes':MAX_GZIP},'budget')
    require(r['expected']==EXPECTED,'expected')
    require(all(r[k] is False for k in ('publicReleaseAuthorized','corpusImportAuthorized','alignmentAuthorized','persistCorpus','emitCorpus')),'publication gate')
    d=json.loads(rights)
    require(all(x['publicReleaseDecision']=='pendiente' and x['authorizationRef'] is None for x in d['editions']) and d['editions'][0]['territorialReview']=='pendiente','rights pending')
    require(r['permissions']=={'rv1909TerritorialReview':'pendiente','rv1909PublicRelease':'pendiente','sblgntPublicRelease':'pendiente'},'permissions')
    require(r['progress']=={'completed':61,'total':69,'afterReaderClosure':62} and r['next']=='P11.4.2.3_integracion_aislada_tras_CI_integracion_y_despliegue','next')
    return json.loads(projection)
def validate_units(edition,book,chapter,units):
    require(isinstance(chapter,str) and re.fullmatch(r'[1-9][0-9]*',chapter) and bool(units),'chapter')
    seen=set();previous=None
    for u in units:
        require(set(u)=={'id','editionId','bookId','chapter','verse','order','text','resourceId','sourceLocator','sourceSegmentSha256','textSha256'},'unit fields')
        require(u['editionId']==edition and u['bookId']==book and u['chapter']==chapter,'unit identity')
        require(isinstance(u['verse'],str) and p.VERSE.fullmatch(u['verse']) and u['verse'] not in seen,'reference')
        require(type(u['order']) is int and u['order']>=0 and (previous is None or u['order']==previous+1),'order')
        require(isinstance(u['resourceId'],str) and bool(u['resourceId']) and isinstance(u['sourceLocator'],str) and bool(u['sourceLocator']),'provenance')
        require(isinstance(u['text'],str) and p.sha(u['text'].encode('utf-8'))==u['textSha256'] and re.fullmatch(r'[0-9a-f]{64}',u['sourceSegmentSha256']),'unit hash')
        require(u['id']==p.unit_id(edition,book,chapter,u['verse'],u['sourceLocator']),'unit id')
        seen.add(u['verse']);previous=u['order']
def historical_gzip(raw):
    # The pinned P11.4.2.2 index was generated with the Unix Gzip OS header (3).
    # Preserve the DEFLATE stream and trailer; only the platform metadata is canonicalized.
    packed=gzip.compress(raw,compresslevel=6,mtime=0)
    return packed[:9]+b'\x03'+packed[10:]
def make_fragment(edition,book,chapter,units):
    units=list(units);validate_units(edition,book,chapter,units)
    payload={'schemaVersion':1,'format':FORMAT,'editionId':edition,'bookId':book,'chapter':chapter,'units':units}
    raw=p.canonical(payload);compressed=historical_gzip(raw)
    require(len(compressed)<=MAX_GZIP,'fragment exceeds gzip budget')
    descriptor={'editionId':edition,'bookId':book,'chapter':chapter,'verses':[u['verse'] for u in units],
        'unitCount':len(units),'emptyMarkers':sum(not u['text'] for u in units),
        'firstOrder':units[0]['order'],'lastOrder':units[-1]['order'],'resourceId':units[0]['resourceId'],
        'jsonBytes':len(raw),'gzipBytes':len(compressed),'sha256':p.sha(raw),'gzipSha256':p.sha(compressed)}
    require(all(u['resourceId']==descriptor['resourceId'] for u in units),'resource mismatch')
    return descriptor,raw,compressed
def verify_fragment(descriptor,raw,compressed):
    require(isinstance(raw,bytes) and isinstance(compressed,bytes),'byte inputs')
    require(len(raw)==descriptor['jsonBytes'] and p.sha(raw)==descriptor['sha256'],'json fingerprint')
    require(len(compressed)==descriptor['gzipBytes'] and len(compressed)<=MAX_GZIP and p.sha(compressed)==descriptor['gzipSha256'],'gzip fingerprint')
    require(gzip.decompress(compressed)==raw,'gzip roundtrip')
    obj=json.loads(raw)
    require(p.canonical(obj)==raw and set(obj)=={'schemaVersion','format','editionId','bookId','chapter','units'} and obj['schemaVersion']==1 and obj['format']==FORMAT,'canonical contract')
    expected,encoded,packed=make_fragment(obj['editionId'],obj['bookId'],obj['chapter'],obj['units'])
    require(expected==descriptor and encoded==raw and packed==compressed,'descriptor mismatch')
    return obj['units']
def project_book(edition,book,units,expected):
    units=list(units)
    require(len(units)==expected['unitCount'] and p.digest_units(units)==expected['projectionSha256'],'source projection mismatch')
    require(all(u['resourceId']==expected['resourceId'] for u in units),'source resource mismatch')
    groups={};last=None;prev_order=None
    for u in units:
        ch=u['chapter']
        require(ch==last or ch not in groups,'noncontiguous chapter')
        require(prev_order is None or u['order']==prev_order+1,'book order')
        groups.setdefault(ch,[]).append(u);last=ch;prev_order=u['order']
    require(len(groups)==expected['chapters'],'chapter coverage')
    index=[];restored=[]
    for chapter,rows in groups.items():
        descriptor,raw,compressed=make_fragment(edition,book,chapter,rows)
        restored.extend(verify_fragment(descriptor,raw,compressed))
        index.append(descriptor)
    require(restored==units and p.digest_units(restored)==expected['projectionSha256'],'book roundtrip')
    require(sum(x['emptyMarkers'] for x in index)==expected['emptyUnitCount'],'empty coverage')
    require([u['sourceLocator'] for u in restored if not u['text']]==expected['emptyUnitLocators'],'empty locators')
    return index
def audit():
    expected=check_plan();p.verify_report(expected)
    fragments={(m['editionId'],f['bookId']):f for m in expected['corpusManifests'] for f in m['fragments']}
    seen=[];index=[]
    def consume(edition,book,units):
        key=(edition,book)
        require(key in fragments and key not in seen,'book coverage')
        seen.append(key);index.extend(project_book(edition,book,units,fragments[key]))
    actual=p.build(on_fragment=consume)
    require(actual==expected and seen==list(fragments),'historical projection/order')
    result={'editions':len({e for e,_ in seen}),'bookFiles':len(seen),'chapters':len(index),'units':sum(x['unitCount'] for x in index),'emptyMarkers':sum(x['emptyMarkers'] for x in index)}
    require(result==EXPECTED,'coverage totals')
    require(len({(x['editionId'],x['bookId'],x['chapter']) for x in index})==len(index),'duplicate fragment')
    # Only aggregate metrics and digest leave the process; no raw corpus or index.
    return {'phase':'P11.4.2.2',**result,'roundTripUnits':result['units'],'fragmentCount':len(index),
        'maxGzipBytes':max(x['gzipBytes'] for x in index),'gzipBudgetBytes':MAX_GZIP,'totalGzipBytes':sum(x['gzipBytes'] for x in index),
        'indexSha256':p.sha(p.canonical(index)),'allFragmentsVerified':True,'corpusPersisted':False,'corpusEmitted':False,'publicationAuthorized':False}
if __name__=='__main__':
    try: print(json.dumps(audit(),sort_keys=True))
    except Exception as exc:
        # Do not print arbitrary exception text or tracebacks containing source content.
        print('P11.4.2.2 projection failed ('+type(exc).__name__+'); corpus not emitted',file=sys.stderr);sys.exit(1)
