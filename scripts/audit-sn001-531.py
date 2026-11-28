import json, hashlib, urllib.request, xml.etree.ElementTree as ET, zipfile, io, re, unicodedata
from pathlib import Path
import importlib.util
spec=importlib.util.spec_from_file_location('p91',Path(__file__).resolve().parent/'audit-editions-p91.py')
p91=importlib.util.module_from_spec(spec); spec.loader.exec_module(p91)
D=Path('docs/investigaciones')
pre=json.loads((D/'SN-001-pre-registro-editorial-531.json').read_text())
def download(url, sha):
    data=p91.fetch(url,16*1024*1024)
    assert hashlib.sha256(data).hexdigest()==sha, url
    return data
def tag(e): return e.tag.rsplit('}',1)[-1]
def norm(s): return ''.join(c for c in unicodedata.normalize('NFD',s) if not unicodedata.combining(c) and c not in '/־')
report={'publicationAuthorized':False,'files':[],'passages':[],'terms':[],'lexical':[],'limitations':[]}
roots={}
for s in pre['sources']:
    if s['id']=='ED-C01':
        raw=download(s['archive']['url'],s['archive']['sha256'])
        z=zipfile.ZipFile(io.BytesIO(raw))
        texts={}
        for f in s['files']:
            matches=[n for n in z.namelist() if n.rsplit('/',1)[-1]==f['path']]
            assert len(matches)==1,f
            data=z.read(matches[0]); assert hashlib.sha256(data).hexdigest()==f['sha256']
            texts[f['book']]=data.decode('utf-8-sig')
        for e in pre['evidence']:
            book=e['book']; ch=e['chapter']; ref=e['reference']
            vpart=ref.split(':')[-1]; lo,_,hi=vpart.partition('-')
            chapter=None; found={}
            for line in texts[book].splitlines():
                m=re.match(r'^\\c\s+(\d+)',line)
                if m: chapter=int(m.group(1))
                m=re.match(r'^\\v\s+(\d+)\s*(.*)',line)
                if m and chapter==ch: found[int(m.group(1))]=m.group(2)
            vs=list(range(int(lo),int(hi or lo)+1)); assert all(v in found for v in vs),ref
            report['passages'].append({'localId':e['localId'],'reference':ref,'verses':vs,'source':'ED-C01','textLocated':True})
        report['files'].append({'id':s['id'],'sha256':s['archive']['sha256'],'verifiedBooks':len(texts)})
    else:
        url='https://raw.githubusercontent.com/'+s['repository']+'/'+s['commit']+'/'+s['path']
        raw=download(url,s['sha256']); roots[s['id']]=ET.fromstring(raw)
        report['files'].append({'id':s['id'],'sha256':s['sha256']})
refs={'E01':('LING-019','Lev.19.28'),'E02':('LING-019','Lev.21.5'),'E03':('LING-020','Deut.14.1')}
for t in pre['terms']:
    item={'passageId':t['passageId'],'reportedForm':t['form'],'reportedStrong':t['strong'],'reportedCode':t['reportedCode']}
    if t['passageId'] in refs:
        sid,ref=refs[t['passageId']]
        verses=[v for v in roots[sid].iter() if tag(v)=='verse' and v.get('osisID')==ref]
        assert len(verses)==1,ref
        words=[w for w in verses[0] if tag(w)=='w']
        matches=[{'position':i+1,'form':''.join(w.itertext()),'lemmaRaw':w.get('lemma'),'morphRaw':w.get('morph')} for i,w in enumerate(words) if norm(''.join(w.itertext()))==norm(t['form'])]
        # Only explicit source segmentation may establish a partial-token match.
        # No arbitrary prefix stripping, fuzzy matching or Strong inference.
        segments=[]
        for i,w in enumerate(words):
            form=''.join(w.itertext())
            parts=form.split('/')
            if len(parts)>1 and all(parts) and norm(parts[-1])==norm(t['form']):
                segments.append({'position':i+1,'form':form,'matchedSegment':parts[-1],'segmentIndex':len(parts),'lemmaRaw':w.get('lemma'),'morphRaw':w.get('morph')})
        item.update(source=sid,reference=ref,matches=matches,status='matched' if matches else 'unresolved',segmentedCandidates=segments,segmentationStatus='explicit_final_segment' if not matches and len(segments)==1 else 'not_resolved_by_segmentation' if not matches else 'whole_token_match')
        if not matches:
            item['verseTokenDiagnostics']=[{'position':i+1,'form':''.join(w.itertext()),'lemmaRaw':w.get('lemma'),'morphRaw':w.get('morph')} for i,w in enumerate(words)]
    else: item['status']='outside_admitted_hebrew_coverage'
    report['terms'].append(item)
strong=roots['LING-017']; idx=roots['LING-016']; bdb=roots['LING-018']
ids={e.get('id') for e in strong.iter() if tag(e)=='entry'}
bids={e.get('id') for e in bdb.iter() if tag(e)=='entry'}
for code in sorted({t['strong'] for t in pre['terms'] if t['strong']}|{'H1417','H1418','H3789'}):
    entries=[e for e in strong.iter() if tag(e)=='entry' and e.get('id')==code]
    links=[]
    for e in idx.iter():
        if tag(e)!='entry': continue
        for x in e:
            if tag(x)=='xref' and x.get('strong') in (code,code[1:]):
                links.append({'indexId':e.get('id'),'bdb':x.get('bdb'),'bdbLocated':x.get('bdb') in bids})
    report['lexical'].append({'strong':code,'entryLocated':code in ids,'directTextDefinitionCount':sum(1 for e in entries for m in e if tag(m)=='meaning' for d in m if tag(d)=='def' and len(d)==0 and (d.text or '').strip()),'indexLinks':links})
report['limitations']=['No se infiere equivalencia entre códigos de proveedores.','Los libros Reyes, Jeremías y Ezequiel carecen de admisión OSHB en este alcance.','La admisión editorial y el snapshot exacto requieren decisión y revisión; este resultado no autoriza publicación.']
Path('sn001-cotejo.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('Archivos:',len(report['files']),'pasajes:',len(report['passages']),'fichas:',len(report['terms']))
print('Coincidencias hebreas:',sum(x['status']=='matched' for x in report['terms']))
assert len(report['files'])==7 and len(report['passages'])==8 and len(report['terms'])==12
