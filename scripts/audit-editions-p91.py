"""P9.1.1 source audit only. Metadata and checksums, never corpus output."""
import hashlib,io,json,pathlib,re,sys,urllib.request,urllib.parse,zipfile,xml.etree.ElementTree as ET,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'docs/P9/candidatos-ediciones-p91.json'
BASE='546b1f34638e5a73abea56cc60be714d9fff87da'
REV='736fdc76158950c3d04b949b7e013ca14305145a'
NT=["Matt","Mark","Luke","John","Acts","Rom","1Cor","2Cor","Gal","Eph","Phil","Col","1Thess","2Thess","1Tim","2Tim","Titus","Phlm","Heb","Jas","1Pet","2Pet","1John","2John","3John","Jude","Rev"]
CODES=["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL","MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"]
GREEK_FILES=[["Matt","data/sblgnt/xml/Matt.xml",909675,"088ee8cd84251001c2a883e464fcdff78bfbedc8"],["Mark","data/sblgnt/xml/Mark.xml",572329,"3b4246c0035cf8ab1ee02f3b29ac126785104c2b"],["Luke","data/sblgnt/xml/Luke.xml",970739,"89b03e63aeb75b5b58e64ae9319d3487e7a8838d"],["John","data/sblgnt/xml/John.xml",762321,"11e232c7ab1b4955b6a982e9c2e7087ac7962083"],["Acts","data/sblgnt/xml/Acts.xml",921255,"168d2faff82b0047805703dfe1892e5655c211c8"],["Rom","data/sblgnt/xml/Rom.xml",347059,"4ed8b74438ddf46787b06a8f6e9738e0d3e63a61"],["1Cor","data/sblgnt/xml/1Cor.xml",342330,"2a0c1a309626f498d6ce76626385d9c2dbf83acd"],["2Cor","data/sblgnt/xml/2Cor.xml",222992,"dc190c5371260c5a92be2af65385f8c84bef1e92"],["Gal","data/sblgnt/xml/Gal.xml",111663,"ef1d329c5771be079ec92d42e1043e2d66d03cfe"],["Eph","data/sblgnt/xml/Eph.xml",120457,"8818f2079ec8139fe930ed506b0b5fb94e80c723"],["Phil","data/sblgnt/xml/Phil.xml",80931,"b40b431df84867230984db2c694b08e457617442"],["Col","data/sblgnt/xml/Col.xml",79114,"c77f562d49291d07faa291cd361126535571b7e6"],["1Thess","data/sblgnt/xml/1Thess.xml",73887,"70427d693af775c88788a446245f5eb977b70c77"],["2Thess","data/sblgnt/xml/2Thess.xml",40902,"566699e2378988a305c5dda4e1e57bd3bb07d4a4"],["1Tim","data/sblgnt/xml/1Tim.xml",81717,"545fb4302fba34238a5e556ac1cd75a01b774fc8"],["2Tim","data/sblgnt/xml/2Tim.xml",62532,"4832ddbb5f3715d691d96849c37f5f191fd20a39"],["Titus","data/sblgnt/xml/Titus.xml",33932,"b85039ae5fe9bc6e77293493fb473ca4a6aaa7e2"],["Phlm","data/sblgnt/xml/Phlm.xml",16865,"ed43eed05e9488ef69dd2e69600d7d358d3910a4"],["Heb","data/sblgnt/xml/Heb.xml",247580,"9c05ad5c9dc99a5090581a23b241c666ced10154"],["Jas","data/sblgnt/xml/Jas.xml",87475,"c13f7154f37163cc2a5c8f93de5ff8b29df64d10"],["1Pet","data/sblgnt/xml/1Pet.xml",85461,"c97dee2ade8c537569a1929989e74863605514b0"],["2Pet","data/sblgnt/xml/2Pet.xml",55525,"412fa72bb55158b85bf2b2771b8eedede86d67ae"],["1John","data/sblgnt/xml/1John.xml",102101,"d664c314bdf41bcdb7cff9b31ab5799d425ab416"],["2John","data/sblgnt/xml/2John.xml",12074,"b50b1739d8954812524660790dc367dcd8a6c3b1"],["3John","data/sblgnt/xml/3John.xml",11161,"308cc92e958f729caae8d6e54492d51d0b63baca"],["Jude","data/sblgnt/xml/Jude.xml",23202,"205234a46d81fea141dd263359c1c8a7d3fa4577"],["Rev","data/sblgnt/xml/Rev.xml",474728,"db52226b1e2cdb4955cda42bf9d10b1739d37abf"]]
LICENSE_SHA='7e7170e3cebf88a9f60c7b8421418323c09304da1af4d5e90f4da1dc1c8a2661'
def require(ok,reason):
    if not ok:raise ValueError(reason)
def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def validate(m):
    require(m['schemaVersion']==1 and m['scope']=='P9.1.1-edition-audit-only' and m['baseline']==BASE and m['publication'] is False and m['admission'] is False,'scope')
    require(m['priorPhase']['pr']==54 and m['priorPhase']['deployRun']==45888104367 and m['priorPhase']['coverageException']=='alcance_parcial_para_continuidad_tecnica','prior scope')
    r,g=m['candidates']
    require(r['id']=='ED-C01' and r['sourceId']=='F05' and r['edition']=='spaRV1909' and r['language']=='spa' and r['type']=='traduccion' and r['file']=={'url':'https://ebible.org/Scriptures/spaRV1909_usfm.zip','format':'USFM ZIP','sha256':None,'bytes':None} and r['expectedBookCodes']==CODES,'RV source')
    require(r['licenseUrl']=='https://ebible.org/spaRV1909/copyright.htm' and r['detailsUrl']=='https://ebible.org/find/details.php?id=spaRV1909' and r['license']=='Public Domain declarado por distribuidor','RV rights')
    require(g['id']=='ED-C02' and g['repository']=='Faithlife/SBLGNT' and g['commit']==REV and g['language']=='grc' and g['type']=='edicion_critica' and g['license']=='CC BY 4.0','Greek source')
    require([[f['book'],f['path'],f['bytes'],f['gitBlobSha1']] for f in g['files']]==GREEK_FILES and [f['order'] for f in g['files']]==list(range(1,28)),'Greek inventory')
    require(all(f['sha256']==('389c6751dc8e5de45c9173fdd3b499aa8574d425345055723ff2a46b2d8d173f' if f['book']=='3John' else None) for f in g['files']),'Greek fingerprints')
    require(g['licenseEvidence']=={'path':'LICENSE','bytes':18650,'gitBlobSha1':'2f244ac814036ecd9ba9f69782e89ce6b1dca9eb','sha256':LICENSE_SHA} and g['readme']=={'path':'README.md','bytes':760,'gitBlobSha1':'26f338de6a1cc51b08a46fc9db5128830c408761'},'Greek license evidence')
    require(all(x['publication'] is False and not x['allowedComponents'] and x['review'].startswith('pendiente_') for x in (r,g)),'admission gate')
    require(m['restricted']==["F10","F11","F12","F13","F14","F15","F20","F21","F24","F25"] and m['policy']=={'alignment':'no_inferida','canon':'distinguir_inventario_y_canon','versification':'referencia_original_sin_correspondencia','persistSource':False},'restriction gate')
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):raise ValueError('redirect')
def fetch(url,limit):
    req=urllib.request.Request(url,headers={'User-Agent':'Scriptura-Nexus-P9.1.1','Accept-Encoding':'identity'})
    with urllib.request.build_opener(NoRedirect()).open(req,timeout=60) as r:b=r.read(limit+1)
    require(0<len(b)<=limit,'download bound');return b
def fixed(meta):
    b=fetch('https://raw.githubusercontent.com/Faithlife/SBLGNT/'+REV+'/'+meta['path'],meta['bytes'])
    require(len(b)==meta['bytes'] and blob(b)==meta['gitBlobSha1'],'git identity')
    if meta.get('sha256'):require(sha(b)==meta['sha256'],'sha256 identity')
    return b
def greek(b):
    b.decode('utf-8-sig',errors='strict')
    require(not re.search(br'<!\s*(?:DOCTYPE|ENTITY)',b,re.I),'unsafe XML')
    root=ET.fromstring(b);require(root.tag=='book' and root.get('id'),'Greek book')
    refs=set();chapters=set();current=None;count=0;empty=0;labels=set();n=0;prefixes=0;suffixes=0
    for x in root.iter():
        if x.tag=='verse-number':
            if current is not None and n==0:empty+=1
            ref=x.get('id','');match=re.fullmatch(r'(.+?) (\d+):(\d+[a-z]?(?:[-–]\d+[a-z]?)?)',ref)
            require(match and ref not in refs,'Greek reference');refs.add(ref);labels.add(match[1]);chapters.add(match[2]);current=ref;n=0
        elif x.tag=='w':
            require(current is not None and x.text and re.search(r'[\u0370-\u03ff\u1f00-\u1fff]',x.text),'Greek word');count+=1;n+=1
        elif x.tag=='prefix':prefixes+=1
        elif x.tag=='suffix':suffixes+=1
    if current is not None and n==0:empty+=1
    require(len(labels)==1 and bool(refs) and count>0,'Greek coverage')
    return {'providerBookId':root.get('id'),'referenceBookLabel':next(iter(labels)),'chapters':len(chapters),'verseMarkers':len(refs),'wordElements':count,'emptyVerseMarkers':empty,'prefixElements':prefixes,'suffixElements':suffixes}
def usfm_member(b):
    s=b.decode('utf-8-sig',errors='strict')
    ids=re.findall(r'(?m)^\\id[ \t]+([A-Z0-9]{3})(?:[ \t].*)?\r?$',s)
    require(len(ids)==1,'USFM id')
    book=ids[0];chapter=None;chapters=set();refs=set();ranges=0
    for line in s.splitlines():
        m=re.match(r'^\\c[ \t]+(\d+)(?:\s|$)',line)
        if m:
            chapter=m[1];require(chapter not in chapters,'USFM duplicate chapter');chapters.add(chapter)
        # Preserve labels, including ranges/suffixes. Never split a range into inferred verses.
        for v in re.finditer(r'(?<!\\)\\v[ \t]+([0-9]+[a-z]?(?:[-–][0-9]+[a-z]?)?)(?=\s|$)',line):
            require(chapter is not None,'USFM verse without chapter');key=(chapter,v[1]);require(key not in refs,'USFM duplicate verse');refs.add(key)
            ranges+=int('-' in v[1] or '–' in v[1])
    return book,{'chapters':len(chapters),'verseMarkers':len(refs),'rangeMarkers':ranges}
def audit_zip(data):
    rows={};ancillary=[];total=0;seen=set()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        require(len(z.infolist())<=200,'archive members')
        for f in z.infolist():
            name=f.filename;require(name not in seen and '\\' not in name and not name.startswith('/') and '..' not in pathlib.PurePosixPath(name).parts,'archive path');seen.add(name)
            require(not f.flag_bits&1 and f.file_size<=8*1024*1024,'archive member bound')
            total+=f.file_size;require(total<=64*1024*1024,'archive expanded bound')
            if f.is_dir():continue
            if not name.lower().endswith(('.usfm','.sfm')):ancillary.append({'path':name,'bytes':f.file_size});continue
            b=z.read(f);require(len(b)==f.file_size,'archive size')
            book,m=usfm_member(b)
            if book not in CODES:
                ancillary.append({'path':name,'bytes':len(b),'providerBookCode':book,'sha256':sha(b)});continue
            require(book not in rows and m['chapters']>0 and m['verseMarkers']>0,'USFM coverage')
            rows[book]={'book':book,'path':name,'bytes':len(b),'sha256':sha(b),**m}
    require(set(rows)==set(CODES),'RV expected inventory')
    return {'files':[rows[c] for c in CODES],'ancillary':ancillary,'books':len(rows),'chapters':sum(x['chapters'] for x in rows.values()),'verseMarkers':sum(x['verseMarkers'] for x in rows.values())}
def main():
    stage='manifest'
    try:
        m=json.loads(MANIFEST.read_text());validate(m);r,g=m['candidates']
        stage='Greek-license';license=fixed(g['licenseEvidence']);readme=fixed(g['readme'])
        require(b'Attribution 4.0 International' in license and b'creativecommons.org/licenses/by/4.0/' in readme,'Greek license')
        stage='Greek-books';gr=[]
        for f in g['files']:
            stage='Greek-'+f['book'];b=fixed(f);gr.append({'book':f['book'],'path':f['path'],'bytes':len(b),'sha256':sha(b),**greek(b)})
        require(len({x['providerBookId'] for x in gr})==27 and len({x['referenceBookLabel'] for x in gr})==27,'Greek unique books')
        j=next(x for x in gr if x['book']=='3John');require(j['verseMarkers']==15 and j['wordElements']==219,'P8 Greek baseline')
        stage='RV-license';lic=fetch(r['licenseUrl'],512*1024);ls=lic.decode('utf-8',errors='strict').lower()
        require('public domain' in ls and 'dominio público' in ls and '1909' in ls,'RV license declaration')
        stage='RV-archive';archive=fetch(r['file']['url'],16*1024*1024)
        rv=audit_zip(archive)
        registry=json.loads((ROOT/'src/data/linguistica/registro.json').read_text())
        require(registry=={'schemaVersion':1,**{k:[] for k in ('editions','units','tokens','lemmas','identifiers','analyses','morphCodes')}},'public registry')
        print(json.dumps({'mode':'P9.1.1-audit-only','greek':{'commit':REV,'licenseSha256':sha(license),'readmeSha256':sha(readme),'books':len(gr),'chapters':sum(x['chapters'] for x in gr),'verseMarkers':sum(x['verseMarkers'] for x in gr),'wordElements':sum(x['wordElements'] for x in gr),'files':gr},'rv1909':{'archiveSha256':sha(archive),'archiveBytes':len(archive),'licenseHtmlSha256':sha(lic),**rv},'newAdmissions':0,'publicationAuthorized':False,'publicRegistryEmpty':True,'alignmentCreated':0},ensure_ascii=True,indent=2))
    except Exception as e:
        safe={'scope','prior scope','RV source','RV rights','Greek source','Greek inventory','Greek fingerprints','Greek license evidence','admission gate','restriction gate','redirect','download bound','git identity','sha256 identity','unsafe XML','Greek book','Greek reference','Greek word','Greek coverage','Greek unique books','P8 Greek baseline','Greek license','RV license declaration','USFM id','USFM duplicate chapter','USFM verse without chapter','USFM duplicate verse','archive members','archive path','archive member bound','archive expanded bound','archive size','USFM coverage','RV expected inventory','public registry'}
        print('P9.1.1 failed at '+stage+' ('+(str(e) if str(e) in safe else type(e).__name__)+'); corpus omitted',file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())
