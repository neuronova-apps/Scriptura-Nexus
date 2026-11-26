"""P8.4.2: validate restricted lexical admission without publishing or persisting entries."""
import collections
import importlib.util
import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT=pathlib.Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'docs/P8/admision-lexica-p84.json'
spec=importlib.util.spec_from_file_location('lexaudit',ROOT/'scripts/audit-lexicon-p84.py')
audit=importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
HASHES={
  "LEX-C01": "734a5b64a1152f67604bf09d32f15c0ba537151961752fcf168087b41b4d93ea",
  "LEX-C02": "848eef2ac16753a43694897dbb9e8f266725e7cc9da4809f367ee5b990f05dbb",
  "LEX-C03": "e7217ca8ff8ff3f21f9cf1bbe87411adf55f6aa88bcf5ed9ddc886cc6b160c5d",
  "LEX-C04": "8f7a605c58899d2f44430149c143c00903976e1e91232476677972a69e5bc85f",
  "LEX-C05": "a628f4f89f8bdaf2483fd3faf1abc8653cc6717758dfc9f24beb7571d9bdd0c4",
  "LEX-C06": "2b52658a4323d91674cda4090ab8b3ebddfff640f4f18143c28300e80b2c38f8",
  "LEX-C07": "46951bf82c40ed35caa8557db190a828b744e305e9619d9451ea5690a90d7101"
}
EVIDENCE={
  "LEX-C01": {
    "README.md": "261d5157c0ffeadeedad3f734db945a4c3642e3e4ce5fa28002985b6c52437b1"
  },
  "LEX-C02": {
    "README.md": "261d5157c0ffeadeedad3f734db945a4c3642e3e4ce5fa28002985b6c52437b1"
  },
  "LEX-C03": {
    "readme.md": "9a129c25674387c494571c3828aa3a8eb78459c165e275c313ae26994ce8ff22"
  },
  "LEX-C04": {
    "readme.md": "9a129c25674387c494571c3828aa3a8eb78459c165e275c313ae26994ce8ff22"
  },
  "LEX-C05": {
    "readme.md": "9a129c25674387c494571c3828aa3a8eb78459c165e275c313ae26994ce8ff22"
  },
  "LEX-C06": {
    "readme.md": "9a129c25674387c494571c3828aa3a8eb78459c165e275c313ae26994ce8ff22"
  },
  "LEX-C07": {
    "LICENSE": "5537d4d10b76b81b6e8dfd8b644480a4b1efa332fbb0cdb61126c5be781ef7b4",
    "README.md": "eada5184215fba69ddd420438e55690fb4ca0c14fdaa1f04a3f6c555b045e839",
    "README-ulrikp.txt": "2eea57fcefa555081d2834cdef44af5a1d000d90eb9ba0d58f4e1fe99c305d2c"
  }
}
POLICY={
  "LEX-C03": {
    "id": "LING-015",
    "components": [
      "identificadores_lexicos"
    ],
    "selectors": [
      "index/w/@aug",
      "index/w/text()"
    ]
  },
  "LEX-C04": {
    "id": "LING-016",
    "components": [
      "anotaciones_lema",
      "identificadores_lexicos"
    ],
    "selectors": [
      "index/part/@xml:lang",
      "index/part/entry/@id",
      "index/part/entry/w/text()",
      "index/part/entry/xref/@aug",
      "index/part/entry/xref/@strong",
      "index/part/entry/xref/@bdb"
    ]
  },
  "LEX-C05": {
    "id": "LING-017",
    "components": [
      "identificadores_lexicos",
      "sentidos_lexicos"
    ],
    "selectors": [
      "lexicon/entry/@id",
      "lexicon/entry/meaning/def/text()"
    ]
  },
  "LEX-C06": {
    "id": "LING-018",
    "components": [
      "identificadores_lexicos",
      "sentidos_lexicos"
    ],
    "selectors": [
      "lexicon/part/@xml:lang",
      "lexicon/part/section/entry/@id",
      "lexicon/part/section/entry/def/text()",
      "lexicon/part/section/entry/sense//def/text()"
    ]
  }
}
NS='{http://openscriptures.github.com/morphhb/namespace}'
LANG='{http://www.w3.org/XML/1998/namespace}lang'
def require(ok,code):
    if not ok: raise ValueError(code)
def verified_decisions(m,prior):
    require(m.get('schemaVersion')==1 and m.get('scope')=='P8.4.2-internal-lexical-validation-only' and m.get('publication') is False,'scope')
    require(m.get('sourceAudit')=={'commit':'69bada4be759e70988d8e21498e95817fdad07a5','runId':45864052007},'audit')
    require(bool(m.get('authorization',{}).get('basis')),'authorization')
    files={x['id']:x for x in audit.validate(prior)}
    ds=m['decisions']
    require(len(ds)==7 and {x['candidateId'] for x in ds}==set(files),'inventory')
    for d in ds:
        cid=d['candidateId'];f=files[cid]
        require(all(d[k]==f[k] for k in ('repository','commit','path','bytes','gitBlobSha1')) and d['sha256']==HASHES[cid] and d['publication'] is False,'source identity')
        expect=[dict(e,sha256=EVIDENCE[cid][e['path']]) for e in f['licenseEvidence']]
        require(d['licenseEvidence']==expect,'evidence')
        p=POLICY.get(cid)
        if p:
            require(d['id']==p['id'] and d['review']=='aprobado' and d['allowedComponents']==p['components'] and d['selectors']==p['selectors'] and d['license']=='CC BY 4.0' and bool(d['attribution']) and d['approvalRef']=='docs/P8/17-admision-lexica.md#'+p['id'].lower() and bool(d['conditions']),'permission scope')
        else:
            require(d['id'] is None and d['review']=='aplazado' and d['allowedComponents']==[] and d['selectors']==[] and d['approvalRef'] is None and d['attribution'] is None and bool(d['conditions']),'deferred resource')
    return [d for d in ds if d['candidateId'] in POLICY]
def root_xml(data,tag):
    text=data.decode('utf-8-sig')
    require(not re.search(r'<!\s*(?:DOCTYPE|ENTITY)',text,re.I),'unsafe XML')
    root=ET.fromstring(text)
    require(root.tag==NS+tag,'unexpected root')
    return root
def unique_ids(entries):
    ids=[e.attrib.get('id','') for e in entries]
    require(all(ids) and len(ids)==len(set(ids)),'entry ids')
    return set(ids)
def plain_def(e):
    return e.tag==NS+'def' and not len(e) and bool((e.text or '').strip())
def inspect(roots):
    aug=roots['LEX-C03'];idx=roots['LEX-C04'];strong=roots['LEX-C05'];bdb=roots['LEX-C06']
    aug_rows=aug.findall(NS+'w')
    aug_keys=[e.attrib.get('aug','') for e in aug_rows]
    require(all(aug_keys) and len(aug_keys)==len(set(aug_keys)) and all((e.text or '').strip() for e in aug_rows),'aug keys')
    index_entries=[(part.attrib.get(LANG,''),e) for part in idx.findall(NS+'part') for e in part.findall(NS+'entry')]
    ids=unique_ids([e for _,e in index_entries])
    require(all(l in ('heb','arc') for l,_ in index_entries),'index language')
    languages=collections.Counter(l for l,_ in index_entries)
    strong_entries=strong.findall(NS+'entry')
    strong_ids=unique_ids(strong_entries)
    bdb_entries=bdb.findall(NS+'part/'+NS+'section/'+NS+'entry')
    bdb_ids=unique_ids(bdb_entries)
    # Exact raw links only. No padding, removing homographs or splitting values.
    refs=[x for _,e in index_entries for x in e.findall(NS+'xref')]
    def refstats(attr,targets):
        values=[x.attrib[attr] for x in refs if attr in x.attrib]
        exact=sum(v in targets for v in values)
        return {'references':len(values),'exactRawTargets':exact,'notExactRawTargets':len(values)-exact}
    defs_strong=[d for e in strong_entries for meaning in e.findall(NS+'meaning') for d in meaning.findall(NS+'def')]
    defs_bdb=[]
    for e in bdb_entries:
        defs_bdb.extend(e.findall(NS+'def'))
        for sense in e.findall(NS+'sense'):
            defs_bdb.extend(sense.iter(NS+'def'))
    return {'augmentedKeys':len(aug_keys),'augmentedTargetsExact':sum((e.text or '') in ids for e in aug_rows),'augmentedTargetsNotExact':sum((e.text or '') not in ids for e in aug_rows),'indexEntries':len(ids),'indexLanguages':dict(sorted(languages.items())),'indexForms':sum(len(e.findall(NS+'w')) for _,e in index_entries),'indexStrongReferences':refstats('strong',strong_ids),'indexBdbReferences':refstats('bdb',bdb_ids),'strongEntries':len(strong_ids),'strongPlainDefinitions':sum(plain_def(e) for e in defs_strong),'strongNonPlainDefinitionsExcluded':sum(not plain_def(e) for e in defs_strong),'bdbEntries':len(bdb_ids),'bdbPlainDefinitions':sum(plain_def(e) for e in defs_bdb),'bdbNonPlainDefinitionsExcluded':sum(not plain_def(e) for e in defs_bdb),'crossVersionCorpusLinksCreated':0,'semanticEquivalencesCreated':0}
def run(m,prior,fetch=audit.download):
    ds=verified_decisions(m,prior)
    roots={};evidence={}
    for d in ds:
        cid=d['candidateId']
        print('Validate '+cid,file=sys.stderr)
        for e in d['licenseEvidence']:
            key=(d['repository'],d['commit'],e['path'])
            if key not in evidence:
                b=fetch(d['repository'],d['commit'],e);audit.check_bytes(b,e);evidence[key]=True
        b=fetch(d['repository'],d['commit'],d);audit.check_bytes(b,d)
        roots[cid]=root_xml(b,'index' if cid in ('LEX-C03','LEX-C04') else 'lexicon')
    report=inspect(roots)
    require(report['augmentedKeys']==9299 and report['indexEntries']==10221 and report['indexLanguages']=={'arc':789,'heb':9432} and report['strongEntries']==8674 and report['bdbEntries']==11845,'baseline counts')
    return {'mode':'P8.4.2-internal-only','admittedFiles':len(ds),'deferredFiles':7-len(ds),'licenseEvidenceVerified':len(evidence),'metrics':report,'persistedEntries':0,'publishedEntries':0}
def main():
    try:
        m=json.loads(MANIFEST.read_text())
        prior=json.loads(audit.MANIFEST.read_text())
        public=json.loads((ROOT/'src/data/linguistica/registro.json').read_text())
        require(public=={'schemaVersion':1,'editions':[],'units':[],'tokens':[],'lemmas':[],'identifiers':[],'analyses':[],'morphCodes':[]},'public registry')
        print(json.dumps(run(m,prior),sort_keys=True,indent=2))
    except Exception as e:
        allowed={'scope','audit','authorization','inventory','source identity','evidence','permission scope','deferred resource','unsafe XML','unexpected root','entry ids','aug keys','index language','baseline counts','public registry','blob mismatch','sha256 mismatch'}
        print('P8.4.2 validation failed: '+(str(e) if str(e) in allowed else type(e).__name__)+'; entry content omitted',file=sys.stderr)
        return 1
    return 0
if __name__=='__main__':sys.exit(main())
