"""P8.4.3: in-memory lexical model, restricted projection and source-local links."""
import collections
import hashlib
import importlib.util
import json
import pathlib
import re
import sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('admission',ROOT/'scripts/review-lexicon-admission-p84.py')
admission=importlib.util.module_from_spec(spec);spec.loader.exec_module(admission)
NS=admission.NS
LANG=admission.LANG
require=admission.require
# Evidence for the ID representation, not executable code or licensed corpus components.
# Both files belong to the same fixed revision as the dictionary.
RULE_EVIDENCE=[
 {'path':'HomeFiles/Script/StrongControl.js','bytes':1666,'gitBlobSha1':'2382264d93a803a4b35f976801060ae77706807a7','sha256':None},
 {'path':'HomeFiles/Script/WordGroup.js','bytes':4091,'gitBlobSha1':'6596766f0818ece1ed8fdbba83916ff0cd15d94d','sha256':None}
]
RULE='OSHB-lexicon-xref-strong-H-prefix-v1'
SYSTEMS={'index':'LING-016','strong':'LING-017','bdb':'LING-018'}
REV='21c9add13bc727d3a951361778e97e3ff7afd1ce'
def canonical(value):
    return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode('utf-8')
def digest(value):return hashlib.sha256(canonical(value)).hexdigest()
def stable(prefix,*parts):return prefix+'-'+digest(parts)
def origin(d,component,selector,locator):
    require(component in d['allowedComponents'] and selector in d['selectors'],'origin scope')
    return {'fileId':d['id'],'commit':d['commit'],'sha256':d['sha256'],'component':component,'selector':selector,'locator':locator}
def kids(node,name):
    return [(i,e) for i,e in enumerate(node.findall(NS+name),1)]
def segment(name,i):return '/'+name+'['+str(i)+']'
def strong_target(raw,targets,rule_verified):
    # A provider-documented representation conversion, not a semantic equivalence.
    # Never apply this rule to augmented keys or an OSHB occurrence lemma.
    if not rule_verified or not re.fullmatch(r'[0-9]+',raw):
        return None
    candidate='H'+raw
    return candidate if candidate in targets else None
def verify_rule(fetch,source):
    evidence=[]
    for e in RULE_EVIDENCE:
        b=fetch(source['repository'],source['commit'],e)
        sha=admission.audit.check_bytes(b,e)
        s=b.decode('utf-8-sig')
        if e['path'].endswith('StrongControl.js'):
            require('currentID = id ? "H" + id : id;' in s and 'getElementById(currentID)' in s,'strong rule evidence')
        else:
            require('xref.getAttribute("strong")' in s and 'strongControl(augID)' in s,'strong rule evidence')
        evidence.append({'path':e['path'],'gitBlobSha1':e['gitBlobSha1'],'sha256':sha})
    return evidence
def project(roots,decisions,rule_verified=False):
    d={x['id']:x for x in decisions}
    entries=[];forms=[];definitions=[];links=[]
    targets={k:{} for k in SYSTEMS}
    def add_entry(system,e,lang,loc,selector):
        source=d[SYSTEMS[system]];raw=e.attrib.get('id','')
        require(bool(raw) and raw not in targets[system],'duplicate entry')
        eid=stable('LENTRY',source['id'],source['commit'],raw)
        targets[system][raw]=eid
        entries.append({'id':eid,'system':system,'providerKey':raw,'language':lang,'origin':origin(source,'identificadores_lexicos',selector,loc+'/@id')})
        return eid
    def add_def(eid,element,source,selector,loc):
        if not admission.plain_def(element):return
        definitions.append({'id':stable('LDEF',eid,loc),'entryId':eid,'text':element.text,'language':'en','origin':origin(source,'sentidos_lexicos',selector,loc+'/text()')})
    def language(raw):
        require(raw in ('heb','arc'),'unknown language')
        return 'hbo' if raw=='heb' else 'arc'
    def add_link(kind,source,raw,loc,selector,entry_id,target_system,target_key,relation,rule=None):
        require(bool(raw),'empty code')
        target_id=targets[target_system].get(target_key) if target_key is not None else None
        links.append({'id':stable('LLINK',source['id'],loc,kind),'kind':kind,'sourceEntryId':entry_id,'rawCode':raw,'targetSystem':target_system,'targetKey':target_key,'targetEntryId':target_id,'state':'documentado' if target_id else 'sin_resolver','relation':relation,'rule':rule,'origin':origin(source,'identificadores_lexicos',selector,loc)})
    # Strong has no admitted language selector; do not infer a language from H.
    for i,e in kids(roots['LEX-C05'],'entry'):
        loc='/lexicon'+segment('entry',i)
        eid=add_entry('strong',e,None,loc,'lexicon/entry/@id')
        for j,meaning in kids(e,'meaning'):
            for k,defn in kids(meaning,'def'):
                add_def(eid,defn,d['LING-017'],'lexicon/entry/meaning/def/text()',loc+segment('meaning',j)+segment('def',k))
    def visit_sense(eid,sense,loc):
        for k,defn in kids(sense,'def'):
            add_def(eid,defn,d['LING-018'],'lexicon/part/section/entry/sense//def/text()',loc+segment('def',k))
        for j,child in kids(sense,'sense'):
            visit_sense(eid,child,loc+segment('sense',j))
    for i,p in kids(roots['LEX-C06'],'part'):
        rawlang=p.attrib.get(LANG,'')
        # Source can include parts without a language; retain explicit absence.
        lang=language(rawlang) if rawlang in ('heb','arc') else None
        for j,section in kids(p,'section'):
            for k,e in kids(section,'entry'):
                loc='/lexicon'+segment('part',i)+segment('section',j)+segment('entry',k)
                eid=add_entry('bdb',e,lang,loc,'lexicon/part/section/entry/@id')
                for n,defn in kids(e,'def'):
                    add_def(eid,defn,d['LING-018'],'lexicon/part/section/entry/def/text()',loc+segment('def',n))
                for n,sense in kids(e,'sense'):visit_sense(eid,sense,loc+segment('sense',n))
    indexed=[]
    for i,p in kids(roots['LEX-C04'],'part'):
        lang=language(p.attrib.get(LANG,''))
        for j,e in kids(p,'entry'):
            loc='/index'+segment('part',i)+segment('entry',j)
            eid=add_entry('index',e,lang,loc,'index/part/entry/@id')
            indexed.append((e,eid,loc))
            for k,w in kids(e,'w'):
                require(not len(w) and bool((w.text or '').strip()),'index form')
                origin_loc=loc+segment('w',k)+'/text()'
                forms.append({'id':stable('LFORM',eid,origin_loc),'entryId':eid,'form':w.text,'language':lang,'origin':origin(d['LING-016'],'anotaciones_lema','index/part/entry/w/text()',origin_loc)})
    for e,eid,loc in indexed:
        for i,x in kids(e,'xref'):
            xloc=loc+segment('xref',i)
            if 'bdb' in x.attrib:
                raw=x.attrib['bdb'];add_link('index-bdb',d['LING-016'],raw,xloc+'/@bdb','index/part/entry/xref/@bdb',eid,'bdb',raw,'referencia_proveedor')
            if 'strong' in x.attrib:
                raw=x.attrib['strong'];target=strong_target(raw,targets['strong'],rule_verified)
                add_link('index-strong',d['LING-016'],raw,xloc+'/@strong','index/part/entry/xref/@strong',eid,'strong',target,'referencia_proveedor',RULE if target is not None else None)
            if 'aug' in x.attrib:
                raw=x.attrib['aug']
                # Preserve the index attribute independently; do not compose codes.
                add_link('index-aug-attribute',d['LING-016'],raw,xloc+'/@aug','index/part/entry/xref/@aug',eid,'index',None,'atributo_sin_resolver')
    for i,w in kids(roots['LEX-C03'],'w'):
        loc='/index'+segment('w',i)
        raw=w.attrib.get('aug','');target=w.text or ''
        add_link('aug-index',d['LING-015'],raw,loc+'/ @aug'.replace(' ',''),'index/w/@aug',None,'index',target,'referencia_proveedor')
    return {'schemaVersion':1,'scope':'internal-only','entries':entries,'forms':forms,'definitions':definitions,'links':links}
def validate_model(model,decisions,rule_verified):
    require(set(model)=={'schemaVersion','scope','entries','forms','definitions','links'} and model['schemaVersion']==1 and model['scope']=='internal-only','model shape')
    admitted={x['id']:x for x in decisions}
    seen=set();entries={}
    def valid_origin(o,component):
        f=admitted.get(o.get('fileId'))
        require(f is not None and o.get('commit')==f['commit'] and o.get('sha256')==f['sha256'] and o.get('component')==component and component in f['allowedComponents'] and o.get('selector') in f['selectors'] and isinstance(o.get('locator'),str) and o['locator'].startswith('/'),'origin scope')
    def unique(row,prefix):
        require(re.fullmatch(prefix+r'-[a-f0-9]{64}',row['id']) and row['id'] not in seen,'record id')
        seen.add(row['id'])
    for e in model['entries']:
        unique(e,'LENTRY');valid_origin(e['origin'],'identificadores_lexicos')
        require(e['system'] in SYSTEMS and e['origin']['fileId']==SYSTEMS[e['system']] and e['language'] in (None,'hbo','arc','grc') and bool(e['providerKey']),'entry shape')
        require(e['id']==stable('LENTRY',e['origin']['fileId'],e['origin']['commit'],e['providerKey']),'entry identity')
        entries[e['id']]=e
    for f in model['forms']:
        unique(f,'LFORM');valid_origin(f['origin'],'anotaciones_lema')
        e=entries.get(f['entryId']);require(e is not None and e['system']=='index' and e['language']==f['language'] and bool(f['form'].strip()),'form shape')
        require(f['id']==stable('LFORM',e['id'],f['origin']['locator']),'form identity')
    for v in model['definitions']:
        unique(v,'LDEF');valid_origin(v['origin'],'sentidos_lexicos')
        e=entries.get(v['entryId']);require(e is not None and e['system'] in ('strong','bdb') and e['origin']['fileId']==v['origin']['fileId'] and v['language']=='en' and bool(v['text'].strip()),'definition shape')
        require(v['id']==stable('LDEF',e['id'],v['origin']['locator'].removesuffix('/text()')),'definition identity')
    for link in model['links']:
        unique(link,'LLINK');valid_origin(link['origin'],'identificadores_lexicos')
        src=entries.get(link['sourceEntryId']);target=entries.get(link['targetEntryId'])
        k=link['kind'];raw=link['rawCode']
        require(link['id']==stable('LLINK',link['origin']['fileId'],link['origin']['locator'],k) and bool(raw),'link identity')
        require(k in ('aug-index','index-bdb','index-strong','index-aug-attribute'),'link kind')
        require((k=='aug-index' and link['sourceEntryId'] is None and link['origin']['fileId']=='LING-015') or (k!='aug-index' and src is not None and src['system']=='index' and link['origin']['fileId']=='LING-016'),'link source')
        require(link['state']==('documentado' if target else 'sin_resolver') and (target is not None or link['targetEntryId'] is None),'link state')
        if target:require(target['system']==link['targetSystem'] and target['providerKey']==link['targetKey'],'target identity')
        if k=='index-strong':
            require(link['targetSystem']=='strong','strong target')
            if target:require(rule_verified and link['rule']==RULE and re.fullmatch(r'[0-9]+',raw) and target['providerKey']=='H'+raw,'strong rule')
        else:require(link['rule'] is None,'unexpected rule')
        if k=='index-bdb':require(link['targetSystem']=='bdb' and link['targetKey']==raw,'bdb raw')
        if k=='index-aug-attribute':require(target is None and link['targetKey'] is None and link['relation']=='atributo_sin_resolver','aug attribute')
        else:require(link['relation']=='referencia_proveedor','link relation')
        if k=='aug-index':require(link['targetSystem']=='index','aug target')
    return model
def load_verified(fetch=admission.audit.download):
    prior=json.loads(admission.audit.MANIFEST.read_text())
    m=json.loads(admission.MANIFEST.read_text())
    ds=admission.verified_decisions(m,prior)
    roots={};seen=set()
    for d in ds:
        for e in d['licenseEvidence']:
            key=(d['repository'],d['commit'],e['path'])
            if key not in seen:
                b=fetch(d['repository'],d['commit'],e);admission.audit.check_bytes(b,e);seen.add(key)
        b=fetch(d['repository'],d['commit'],d);admission.audit.check_bytes(b,d)
        roots[d['candidateId']]=admission.root_xml(b,'index' if d['candidateId'] in ('LEX-C03','LEX-C04') else 'lexicon')
    rule=verify_rule(fetch,next(d for d in ds if d['id']=='LING-016'))
    return roots,ds,rule
def main():
    stage='public gate'
    try:
        public=json.loads((ROOT/'src/data/linguistica/registro.json').read_text())
        require(public=={'schemaVersion':1,'editions':[],'units':[],'tokens':[],'lemmas':[],'identifiers':[],'analyses':[],'morphCodes':[]},'public gate')
        stage='verified sources';roots,ds,evidence=load_verified()
        stage='projection';model=project(roots,ds,True);validate_model(model,ds,True)
        stage='repeatability';again=project(roots,ds,True);require(digest(model)==digest(again),'repeatability')
        stage='baseline'
        counts=collections.Counter(e['system'] for e in model['entries'])
        require(dict(counts)=={'strong':8674,'bdb':11845,'index':10221} and len(model['forms'])==10221 and len(model['definitions'])==35496,'baseline')
        link_counts={k:dict(collections.Counter(l['state'] for l in model['links'] if l['kind']==k)) for k in sorted({l['kind'] for l in model['links']})}
        require(link_counts.get('aug-index')=={'documentado':9299} and link_counts.get('index-bdb')=={'documentado':10175},'baseline links')
        print(json.dumps({'mode':'P8.4.3-internal-only','entries':dict(counts),'forms':len(model['forms']),'definitions':len(model['definitions']),'links':link_counts,'strongRuleEvidence':evidence,'sha256':digest(model),'crossVersionCorpusLinks':0,'semanticEquivalences':0,'persisted':0,'published':0},indent=2,sort_keys=True))
    except Exception as e:
        allowed={'origin scope','duplicate entry','unknown language','index form','empty code','model shape','record id','entry shape','entry identity','form shape','form identity','definition shape','definition identity','link identity','link kind','link source','link state','target identity','strong target','strong rule','unexpected rule','bdb raw','aug attribute','link relation','aug target','strong rule evidence','public gate','repeatability','baseline','baseline links','blob mismatch','sha256 mismatch'}
        print('P8.4.3 failed at '+stage+' ('+(str(e) if str(e) in allowed else type(e).__name__)+'); data omitted',file=sys.stderr)
        return 1
    return 0
if __name__=='__main__':sys.exit(main())
