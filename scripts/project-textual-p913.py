"""P9.1.3: source-pinned, in-memory textual projection. No corpus is written or printed."""
import hashlib,importlib.util,io,json,pathlib,re,sys,zipfile,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
P912=load('p912',pathlib.Path('scripts/validate-editions-p912.py'))
P91=P912.p91
ADMISSION=ROOT/'docs/P9/admisiones-ediciones-p912.json'
CANDIDATES=ROOT/'docs/P9/candidatos-ediciones-p91.json'
BASELINE='13776e1d81692ab0336929ca282c9bfaf420ee37'
SPANISH_NAMES={'GEN':'Génesis','EXO':'Éxodo','LEV':'Levítico','NUM':'Números','DEU':'Deuteronomio','JOS':'Josué','JDG':'Jueces','RUT':'Rut','1SA':'1 Samuel','2SA':'2 Samuel','1KI':'1 Reyes','2KI':'2 Reyes','1CH':'1 Crónicas','2CH':'2 Crónicas','EZR':'Esdras','NEH':'Nehemías','EST':'Ester','JOB':'Job','PSA':'Salmos','PRO':'Proverbios','ECC':'Eclesiastés','SNG':'Cantar de los Cantares','ISA':'Isaías','JER':'Jeremías','LAM':'Lamentaciones','EZK':'Ezequiel','DAN':'Daniel','HOS':'Oseas','JOL':'Joel','AMO':'Amós','OBA':'Abdías','JON':'Jonás','MIC':'Miqueas','NAM':'Nahúm','HAB':'Habacuc','ZEP':'Sofonías','HAG':'Hageo','ZEC':'Zacarías','MAL':'Malaquías','MAT':'Mateo','MRK':'Marcos','LUK':'Lucas','JHN':'Juan','ACT':'Hechos','ROM':'Romanos','1CO':'1 Corintios','2CO':'2 Corintios','GAL':'Gálatas','EPH':'Efesios','PHP':'Filipenses','COL':'Colosenses','1TH':'1 Tesalonicenses','2TH':'2 Tesalonicenses','1TI':'1 Timoteo','2TI':'2 Timoteo','TIT':'Tito','PHM':'Filemón','HEB':'Hebreos','JAS':'Santiago','1PE':'1 Pedro','2PE':'2 Pedro','1JN':'1 Juan','2JN':'2 Juan','3JN':'3 Juan','JUD':'Judas','REV':'Apocalipsis'}
SBL_TO_USFM=dict(zip([x[0] for x in P91.GREEK_FILES],P91.CODES[39:]))
VERSE=re.compile(r'^[0-9]+[a-z]?(?:[-–][0-9]+[a-z]?)?$')
GREEK=re.compile(r'[\u0370-\u03ff\u1f00-\u1fff]')
def require(ok,reason):
    if not ok:raise ValueError(reason)
def sha(data):return hashlib.sha256(data).hexdigest()
def canonical(value):return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode('utf-8')
def digest_units(units):
    h=hashlib.sha256()
    for unit in units:h.update(canonical(unit)+b'\n')
    return h.hexdigest()
def unit_id(edition,book,chapter,verse,locator):
    raw='\x1f'.join((edition,book,chapter,verse,locator)).encode('utf-8')
    return 'UNIT-'+hashlib.sha256(raw).hexdigest()
def make_unit(edition,book_id,chapter,verse,order,text,resource_id,locator,segment_digest):
    require(isinstance(chapter,str) and chapter.isdigit() and int(chapter)>0 and isinstance(verse,str) and VERSE.fullmatch(verse),'referencia')
    require(isinstance(text,str) and not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd]',text),'texto Unicode')
    require(isinstance(segment_digest,str) and re.fullmatch(r'[0-9a-f]{64}',segment_digest),'huella de segmento')
    require(isinstance(locator,str) and locator.strip(),'localizador')
    return {'id':unit_id(edition,book_id,chapter,verse,locator),'editionId':edition,'bookId':book_id,'chapter':chapter,'verse':verse,'order':order,
            'text':text,'resourceId':resource_id,'sourceLocator':locator,'sourceSegmentSha256':segment_digest,'textSha256':sha(text.encode('utf-8'))}
def render_usfm_fragment(raw):
    s=raw.replace('\r\n','\n').replace('\r','\n')
    excluded={'footnotes':0,'crossReferences':0,'figures':0,'sidebars':0}
    for marker,key in [('f','footnotes'),('x','crossReferences'),('fig','figures')]:
        pattern=r'\\'+marker+r'[ \t]+.*?\\'+marker+r'\*'
        s,n=re.subn(pattern,' ',s,flags=re.S);excluded[key]=n
        require(s.count('\\'+marker+'*')==0,'bloque USFM sin cierre')
    s,n=re.subn(r'\\esb\b.*?\\esbe\b',' ',s,flags=re.S);excluded['sidebars']=n
    heading=r'(?m)^[ \t]*\\(?:s\d?|ms\d?|mr|r|sp|d|cl|cd|qa|qc|qm\d?|qd)\b[^\r\n]*(?:\r?\n|$)'
    s=re.sub(heading,' ',s)
    s=re.sub(r'\\w[ \t]+([^|\\\r\n]+)(?:\|[^\\\r\n]*)?\\w\*',lambda m:m.group(1),s)
    s=re.sub(r'\\[A-Za-z0-9]+-s[ \t]+\|.*?\\\*',' ',s,flags=re.S)
    s=re.sub(r'\|[^\\\r\n]*','',s)
    s=re.sub(r'\\\+?[A-Za-z0-9]+(?:\*)?','',s)
    s=re.sub(r'\\\*','',s)
    s=s.replace('~',' ')
    return re.sub(r'\s+',' ',s).strip(),excluded
def parse_usfm_units(data,expected_book,edition_id='TXT-RV1909',book_id=None,resource_id='REC-ED-C01-TEST',order_start=0):
    require(isinstance(data,bytes) and 0<len(data)<=8*1024*1024,'USFM bytes')
    source=data.decode('utf-8-sig',errors='strict')
    require('\ufffd' not in source,'USFM Unicode')
    ids=re.findall(r'(?m)^\\id[ \t]+([A-Z0-9]{3})(?:[ \t].*)?$',source)
    require(ids==[expected_book],'USFM book')
    markers=list(re.finditer(r'\\([cv])[ \t]+([^\s]+)',source))
    chapter=None;units=[];excluded={'footnotes':0,'crossReferences':0,'figures':0,'sidebars':0};ranges=0
    for index,marker in enumerate(markers):
        kind,label=marker.group(1),marker.group(2)
        if kind=='c':
            require(re.fullmatch(r'[1-9][0-9]*',label) is not None,'USFM chapter')
            chapter=label;continue
        require(chapter is not None and VERSE.fullmatch(label) is not None,'USFM verse reference')
        require(not any(x['chapter']==chapter and x['verse']==label for x in units),'USFM duplicate verse')
        end=markers[index+1].start() if index+1<len(markers) else len(source)
        raw=source[marker.end():end];text,counts=render_usfm_fragment(raw)
        for k,v in counts.items():excluded[k]+=v
        locator=expected_book+'.'+chapter+'.'+label
        units.append(make_unit(edition_id,book_id or 'LIB-'+expected_book,chapter,label,order_start+len(units),text,resource_id,locator,sha(raw.encode('utf-8'))))
        ranges+=int('-' in label or '–' in label)
    require(units,'USFM no contiene unidades')
    return units,{'chapters':len({x['chapter'] for x in units}),'unitCount':len(units),'emptyUnitCount':sum(not x['text'] for x in units),'wordElements':None,'rangeMarkers':ranges,'excluded':excluded}
def parse_sbl_xml(data,expected_provider_id,expected_label,edition_id='TXT-SBLGNT-V1-2',book_id='LIB-JHN',resource_id='REC-ED-C02-TEST',order_start=0):
    require(isinstance(data,bytes) and 0<len(data)<=4*1024*1024,'XML bytes')
    require(not re.search(br'<!\s*(?:DOCTYPE|ENTITY)',data,re.I),'XML DTD/entity')
    data.decode('utf-8-sig',errors='strict')
    root=ET.fromstring(data);require(root.tag=='book' and root.get('id')==expected_provider_id,'SBL book')
    allowed={'book','title','p','verse-number','w','prefix','suffix'}
    units=[];current=None;words=0;prefixes=0;suffixes=0;chapters=set();seen=set()
    def finish():
        nonlocal current
        if current is None:return
        require(not current['pendingPrefix'],'SBL prefix without word')
        text=current['text'].strip();events=canonical(current['events'])
        units.append(make_unit(edition_id,book_id,current['chapter'],current['verse'],order_start+len(units),text,resource_id,current['locator'],sha(events)))
        current=None
    for node in root.iter():
        tag=node.tag;require(tag in allowed,'SBL unsupported XML element')
        if tag=='verse-number':
            finish();ref=node.get('id','')
            m=re.fullmatch(r'(.+?) ([1-9][0-9]*):([0-9]+[a-z]?(?:[-–][0-9]+[a-z]?)?)',ref)
            require(m is not None and m.group(1)==expected_label and ref not in seen,'SBL reference')
            seen.add(ref);chapters.add(m.group(2))
            current={'chapter':m.group(2),'verse':m.group(3),'locator':ref,'text':'','pendingPrefix':'','events':[]}
        elif tag in ('w','prefix','suffix'):
            content=''.join(node.itertext())
            if current is None:
                require(not content.strip(),'SBL text outside unit')
                continue
            current['events'].append([tag,content])
            if tag=='prefix':current['pendingPrefix']+=content;prefixes+=1
            elif tag=='w':
                require(content.strip() and GREEK.search(content),'SBL Greek word')
                if current['text'] and not current['text'][-1].isspace():current['text']+=' '
                current['text']+=current['pendingPrefix']+content;current['pendingPrefix']='';words+=1
            else:current['text']+=content;suffixes+=1
        elif tag=='p' and node.text and node.text.strip():require(current is None,'SBL text outside word elements')
    finish();require(units and words>0,'SBL empty corpus')
    return units,{'chapters':len(chapters),'unitCount':len(units),'emptyUnitCount':sum(x['text']=='' for x in units),'wordElements':words,'rangeMarkers':sum('-' in x['verse'] or '–' in x['verse'] for x in units),'prefixElements':prefixes,'suffixElements':suffixes}
def verify_registry_empty():
    registry=json.loads((ROOT/'src/data/linguistica/registro.json').read_text(encoding='utf-8'))
    publications=json.loads((ROOT/'src/data/publicaciones/registro.json').read_text(encoding='utf-8'))
    require(registry=={'schemaVersion':1,**{k:[] for k in ('editions','units','tokens','lemmas','identifiers','analyses','morphCodes')}},'registro lingüístico')
    require(publications=={'schemaVersion':1,'snapshots':[]},'registro de publicaciones')
def verify_report(report):
    require(report['schemaVersion']==1 and report['phase']=='P9.1.3' and report['mode']=='in_memory_validation_only','report schema')
    require(report['baselineMain']==BASELINE and len(report['editions'])==2 and len(report['books'])==66 and len(report['corpusManifests'])==2,'report coverage')
    require(report['entityCounts']['ENT19']==2 and report['entityCounts']['ENT20']==0 and report['entityCounts']['ENT21']==0 and report['entityCounts']['ENT22']==66 and report['entityCounts']['ENT23']>0 and report['entityCounts']['ENT37']==2,'entity counts')
    require(report['controls']=={'corpusTextPersisted':False,'sourceTextEmitted':False,'publicRegistryChanged':False,'canonAssignments':0,'versificationAssignments':0,'alignmentsCreated':0,'publicationAuthorized':False},'safety controls')
    require(not any(k in report for k in ('units','tokens','alignments','corpus')),'raw corpus in report')
    for ed,manifest in zip(report['editions'],report['corpusManifests']):
        require(ed['id']==manifest['editionId'] and ed['canonId'] is None and ed['versificationId'] is None and ed['referencePolicy']=='source_native_unmapped','edition scope')
        require(manifest['persistence']=='metadata_only' and manifest['publicationEnabled'] is False,'publication gate')
        require(len(manifest['resources'])==len(manifest['fragments'])==len(ed['resourceIds'])==len(ed['coverageBookIds']),'manifest coverage')
        require(manifest['integrity']['unitCount']==sum(x['unitCount'] for x in manifest['fragments']),'manifest units')
        require(re.fullmatch(r'[0-9a-f]{64}',manifest['integrity']['projectionSha256']),'manifest hash')
        require(all(x['sha256']==f['sourceFileSha256'] and re.fullmatch(r'[0-9a-f]{64}',x['sha256']) for x,f in zip(manifest['resources'],manifest['fragments'])),'resource fingerprints')
    return report
def build():
    admission_bytes=ADMISSION.read_bytes();admission=json.loads(admission_bytes);candidates=json.loads(CANDIDATES.read_text(encoding='utf-8'))
    P912.validate_manifest(admission,candidates);verify_registry_empty()
    rv,greek=admission['decisions'];editions=[];books={};manifests=[];all_units=0
    rv_archive=P91.fetch(rv['sourceArchive']['url'],16*1024*1024)
    require(len(rv_archive)==rv['sourceArchive']['bytes'] and sha(rv_archive)==rv['sourceArchive']['sha256'],'RV archive fingerprint')
    rv_audit=P91.audit_zip(rv_archive)
    require(rv_audit['files']==rv['sourceArchive']['files'] and rv_audit['books']==66 and rv_audit['chapters']==1189 and rv_audit['verseMarkers']==31102,'RV source inventory')
    rv_id='TXT-RV1909';rv_license='LIC-ED-C01-PUBLIC-DOMAIN-DECLARED';rv_resources=[];rv_fragments=[];rv_book_ids=[];rv_order=0
    with zipfile.ZipFile(io.BytesIO(rv_archive)) as archive:
        for meta in rv['sourceArchive']['files']:
            body=archive.read(meta['path']);code=meta['book'];book_id='LIB-'+code;resource_id='REC-ED-C01-'+code
            units,metrics=parse_usfm_units(body,code,rv_id,book_id,resource_id,rv_order)
            require(metrics['unitCount']==meta['verseMarkers'] and metrics['chapters']==meta['chapters'] and metrics['rangeMarkers']==meta['rangeMarkers'],'RV projected coverage')
            rv_order+=len(units);all_units+=len(units);rv_book_ids.append(book_id)
            rv_resources.append({'id':resource_id,'sourceFileId':'ED-C01:'+code,'sourceId':'F05','path':meta['path'],'bytes':meta['bytes'],'sha256':meta['sha256'],'component':'texto_fuente','licenseRef':rv_license})
            rv_fragments.append({'id':'FRAG-ED-C01-'+code,'bookId':book_id,'resourceId':resource_id,'chapters':metrics['chapters'],'unitCount':metrics['unitCount'],'emptyUnitCount':metrics['emptyUnitCount'],'wordElements':None,'rangeMarkers':metrics['rangeMarkers'],'sourceFileSha256':meta['sha256'],'projectionSha256':digest_units(units)})
            books[book_id]={'id':book_id,'code':code,'names':{'es':SPANISH_NAMES[code]},'aliases':[code]}
    editions.append({'id':rv_id,'sourceId':'F05','name':'Reina-Valera 1909','language':'spa','kind':'traduccion','version':'spaRV1909','provider':'eBible.org','resourceIds':[x['id'] for x in rv_resources],'canonId':None,'versificationId':None,'coverageBookIds':rv_book_ids,'referencePolicy':'source_native_unmapped','licenseRef':rv_license,'attribution':'Reina y Valera, según ficha de eBible.org; distribución spaRV1909.','sourceRevision':{'archiveSha256':rv['sourceArchive']['sha256']}})
    rv_global=hashlib.sha256()
    for f,r in zip(rv_fragments,rv_resources):rv_global.update(canonical({'fragment':f['projectionSha256'],'source':r['sha256'],'resource':r['id']})+b'\n')
    manifests.append({'id':'COR-RV1909-P913','editionId':rv_id,'dataVersion':'p9.1.3-projection-v1','resources':rv_resources,'fragments':rv_fragments,'integrity':{'algorithm':'SHA-256','sourceFileCount':66,'unitCount':rv_order,'emptyUnitCount':sum(x['emptyUnitCount'] for x in rv_fragments),'projectionSha256':rv_global.hexdigest()},'license':{'licenseRef':rv_license,'type':'Public Domain declarado por distribuidor','attribution':'Reina y Valera, según ficha de eBible.org; distribución spaRV1909.','publicationApproved':False},'persistence':'metadata_only','publicationEnabled':False})
    gr_id='TXT-SBLGNT-V1-2';gr_license='LIC-CC-BY-4.0';gr_resources=[];gr_fragments=[];gr_book_ids=[];gr_order=0
    for meta in greek['sourceFiles']:
        body=P91.fixed(meta);source_metrics=P91.greek(body);code=SBL_TO_USFM[meta['book']];book_id='LIB-'+code;resource_id='REC-ED-C02-'+code
        units,metrics=parse_sbl_xml(body,source_metrics['providerBookId'],source_metrics['referenceBookLabel'],gr_id,book_id,resource_id,gr_order)
        require(metrics['unitCount']==meta['verseMarkers'] and metrics['chapters']==meta['chapters'] and metrics['wordElements']==meta['wordElements'] and metrics['emptyUnitCount']==meta['emptyVerseMarkers'],'SBL projected coverage')
        require(metrics['prefixElements']==meta['prefixElements'] and metrics['suffixElements']==meta['suffixElements'],'SBL prefix/suffix inventory')
        gr_order+=len(units);all_units+=len(units);gr_book_ids.append(book_id)
        gr_resources.append({'id':resource_id,'sourceFileId':'ED-C02:'+meta['book'],'sourceId':'F03','path':meta['path'],'bytes':meta['bytes'],'sha256':meta['sha256'],'component':'texto_fuente','licenseRef':gr_license})
        gr_fragments.append({'id':'FRAG-ED-C02-'+code,'bookId':book_id,'resourceId':resource_id,'chapters':metrics['chapters'],'unitCount':metrics['unitCount'],'emptyUnitCount':metrics['emptyUnitCount'],'wordElements':metrics['wordElements'],'rangeMarkers':metrics['rangeMarkers'],'sourceFileSha256':meta['sha256'],'projectionSha256':digest_units(units)})
        books[book_id]['aliases'].extend([source_metrics['referenceBookLabel'],meta['book']])
    editions.append({'id':gr_id,'sourceId':'F03','name':'SBL Greek New Testament','language':'grc','kind':'edicion_critica','version':'v1.2','provider':'Faithlife/SBLGNT','resourceIds':[x['id'] for x in gr_resources],'canonId':None,'versificationId':None,'coverageBookIds':gr_book_ids,'referencePolicy':'source_native_unmapped','licenseRef':gr_license,'attribution':'The SBL Greek New Testament (SBLGNT), edited by Michael W. Holmes. Copyright 2010 Society of Biblical Literature and Logos Bible Software. Licensed under CC BY 4.0.','sourceRevision':{'commit':greek['sourceCommit']}})
    gr_global=hashlib.sha256()
    for f,r in zip(gr_fragments,gr_resources):gr_global.update(canonical({'fragment':f['projectionSha256'],'source':r['sha256'],'resource':r['id']})+b'\n')
    manifests.append({'id':'COR-SBLGNT-V1-2-P913','editionId':gr_id,'dataVersion':'p9.1.3-projection-v1','resources':gr_resources,'fragments':gr_fragments,'integrity':{'algorithm':'SHA-256','sourceFileCount':27,'unitCount':gr_order,'emptyUnitCount':sum(x['emptyUnitCount'] for x in gr_fragments),'projectionSha256':gr_global.hexdigest()},'license':{'licenseRef':gr_license,'type':'CC BY 4.0','attribution':editions[1]['attribution'],'publicationApproved':False},'persistence':'metadata_only','publicationEnabled':False})
    require(len(books)==66 and len(rv_resources)==66 and len(gr_resources)==27 and all(x in books for x in gr_book_ids),'book identities')
    report={'schemaVersion':1,'phase':'P9.1.3','mode':'in_memory_validation_only','baselineMain':BASELINE,'admissionManifestSha256':sha(admission_bytes),'editions':editions,'books':list(books.values()),'corpusManifests':manifests,
            'entityCounts':{'ENT19':2,'ENT20':0,'ENT21':0,'ENT22':66,'ENT23':all_units,'ENT37':2},
            'controls':{'corpusTextPersisted':False,'sourceTextEmitted':False,'publicRegistryChanged':False,'canonAssignments':0,'versificationAssignments':0,'alignmentsCreated':0,'publicationAuthorized':False},
            'textPolicies':{'rv1909':'USFM main-text v1: remove footnotes/cross-references/headings and formatting markers; preserve visible text, punctuation and Unicode; collapse whitespace; retain raw source-segment hash and source-file hash.','sblgnt':'SBLGNT XML v1: project w elements with prefix/suffix in source order; preserve source chapter/verse labels and punctuation; use a single separator between adjacent words; do not infer missing markers.'}}
    verify_report(report);return report
def main():
    try:
        report=build();print(json.dumps(report,ensure_ascii=False,sort_keys=True,indent=2));return 0
    except Exception as exc:
        safe={'phase','audit evidence','decision scope','publication gate','controls','decision count','RV admission','RV rights','RV archive','RV inventory','RV fingerprints','RV totals','RV ancillary','RV alignment','RV publication','Greek admission','Greek commit','Greek license','Greek version evidence','Greek inventory','Greek fingerprints','Greek git identity','Greek totals','Greek alignment','pericope','Greek publication','F19 scope','deferred sources','restricted sources','admission boundary','download bound','redirect','RV license page','RV details','RV archive fingerprint','RV member fingerprints','SBL license','SBL attribution','SBL editor','SBL version','SBL metadata','SBL pericope markers','SBL metrics and fingerprints','linguistic registry','publication registry','RV archive fingerprint','RV source inventory','RV projected coverage','SBL projected coverage','SBL prefix/suffix inventory','book identities','USFM bytes','USFM Unicode','USFM book','USFM chapter','USFM verse reference','USFM duplicate verse','USFM no contiene unidades','USFM ID','XML bytes','XML DTD/entity','SBL book','SBL reference','SBL unsupported XML element','SBL text outside unit','SBL text outside word elements','SBL prefix without word','SBL Greek word','SBL empty corpus','report schema','report coverage','entity counts','safety controls','edition scope','publication gate','manifest coverage','manifest units','manifest hash','resource fingerprints'}
        reason=str(exc) if str(exc) in safe else type(exc).__name__
        print('P9.1.3 failed ('+reason+'); no corpus persisted',file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
