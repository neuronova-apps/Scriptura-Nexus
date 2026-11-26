"""ENT30 unit-level contract and internal coverage audit. No automatic alignments."""
import datetime,importlib.util,json,pathlib,re,sys
from collections import Counter
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('reader_p922',ROOT/'scripts/reader-navigation-p922.py')
reader=importlib.util.module_from_spec(spec);spec.loader.exec_module(reader)
REGISTRY=ROOT/'docs/P9/alineaciones-p931.json'
ENDPOINT_KEYS=('unitId','editionId','bookId','chapter','verse','resourceId','sourceLocator','sourceSegmentSha256','textSha256')
KINDS={(False,False):'one_to_one',(False,True):'one_to_many',(True,False):'many_to_one',(True,True):'many_to_many'}

def need(condition,message):
    if not condition:raise ValueError(message)

def exact(value,keys):
    return isinstance(value,dict) and set(value)==set(keys)

def nonblank(v):
    return isinstance(v,str) and bool(v.strip()) and not re.search(r'[\x00-\x1f\x7f]',v)

def identifier(v,prefix):
    return isinstance(v,str) and bool(re.fullmatch(prefix+r'-[A-Za-z0-9][A-Za-z0-9_-]*',v))

def sha256(v):
    return isinstance(v,str) and bool(re.fullmatch(r'[a-f0-9]{64}',v))

def date(v):
    try:return isinstance(v,str) and datetime.date.fromisoformat(v).isoformat()==v
    except ValueError:return False

def endpoint(row):
    return {'unitId':row['id'],**{k:row[k] for k in ENDPOINT_KEYS if k!='unitId'}}

def inventory_from_navigation(nav,edition_ids):
    inventory={}
    for edition in edition_ids:
        books=nav.books(edition)
        need(books['status']=='available','edition unavailable')
        for book in books['books']:
            for chapter in nav.chapters(edition,book)['chapters']:
                for verse in nav.verses(edition,book,chapter)['verses']:
                    found=nav.locate(edition,book,chapter,verse)
                    need(found['status'] in ('verified_fragment','empty_marker'),'unverified reference')
                    ep=endpoint(found['reference'])
                    need(ep['unitId'] not in inventory,'duplicate source unit')
                    inventory[ep['unitId']]={'endpoint':ep,'order':found['reference']['order'],'empty':found['status']=='empty_marker'}
    return inventory

def validate_group(group,edition_id,inventory):
    need(isinstance(group,list) and len(group)>0,'empty endpoint group')
    ids=[];orders=[]
    for ep in group:
        need(exact(ep,ENDPOINT_KEYS) and all(nonblank(ep[k]) for k in ENDPOINT_KEYS),'endpoint shape')
        need(identifier(ep['unitId'],'UNIT') and identifier(ep['editionId'],'TXT') and identifier(ep['bookId'],'LIB') and identifier(ep['resourceId'],'REC'),'endpoint identity')
        need(ep['editionId']==edition_id and re.fullmatch(r'[1-9][0-9]*',ep['chapter']) and reader.p.VERSE.fullmatch(ep['verse']),'endpoint scope')
        need(sha256(ep['sourceSegmentSha256']) and sha256(ep['textSha256']),'endpoint hash')
        trusted=inventory.get(ep['unitId'])
        need(trusted is not None and trusted['endpoint']==ep,'unknown or altered endpoint')
        need(not trusted['empty'],'empty marker is not an aligned text')
        ids.append(ep['unitId']);orders.append(trusted['order'])
    need(len(ids)==len(set(ids)) and all(a<b for a,b in zip(orders,orders[1:])),'duplicate or unordered endpoint')
    return tuple(ids)

def validate_mapping(mapping,inventory,edition_ids):
    need(exact(mapping,('sourceEditionId','targetEditionId','sourceUnits','targetUnits','relationship')),'mapping shape')
    source,target=mapping['sourceEditionId'],mapping['targetEditionId']
    need(isinstance(source,str) and isinstance(target,str) and source in edition_ids and target in edition_ids and source!=target,'distinct known editions required')
    left=validate_group(mapping['sourceUnits'],source,inventory)
    right=validate_group(mapping['targetUnits'],target,inventory)
    need(mapping['relationship']==KINDS[(len(left)>1,len(right)>1)],'relationship cardinality')
    return source,target,left,right

def reverse_key(key):
    s,t,left,right=key
    return (t,s,right,left)

def validate_registry(value,inventory,edition_ids):
    """Structural and referential validation; documentary approval remains a human responsibility."""
    need(exact(value,('schemaVersion','phase','scope','publicationAuthorized','evidence','alignments')),'registry shape')
    need(type(value['schemaVersion']) is int and value['schemaVersion']==1 and value['phase']=='P9.3.1' and value['scope']=='unit' and value['publicationAuthorized'] is False,'registry boundary')
    need(isinstance(value['evidence'],list) and isinstance(value['alignments'],list),'registry arrays')
    evidence={};used_evidence=set()
    for ev in value['evidence']:
        need(exact(ev,('id','sourceRef','sourceRevision','sourceSha256','locator','reviewedBy','reviewedOn','verification','mapping')),'evidence shape')
        need(identifier(ev['id'],'EVD') and ev['id'] not in evidence,'evidence identity')
        need(all(nonblank(ev[k]) for k in ('sourceRef','sourceRevision','locator','reviewedBy')) and sha256(ev['sourceSha256']) and date(ev['reviewedOn']) and ev['verification']=='verified','documentary review required')
        key=validate_mapping(ev['mapping'],inventory,edition_ids)
        evidence[ev['id']]=key
    alignment_ids=set();keys=set();occupied=set()
    for al in value['alignments']:
        need(exact(al,('id','scope','verification','evidenceIds','mapping')),'alignment shape')
        need(identifier(al['id'],'ALI') and al['id'] not in alignment_ids and al['scope']=='unit' and al['verification']=='verified','alignment identity or state')
        key=validate_mapping(al['mapping'],inventory,edition_ids)
        refs=al['evidenceIds']
        need(isinstance(refs,list) and len(refs)>0 and all(isinstance(x,str) for x in refs) and len(set(refs))==len(refs),'alignment without evidence')
        need(all(x in evidence and evidence[x]==key for x in refs),'evidence does not support exact mapping')
        need(key not in keys and reverse_key(key) not in keys,'duplicate alignment')
        source,target,left,right=key
        # A unit may participate in one verified group per edition pair. More complex
        # overlaps must be reviewed as a single group; no silent conflicting mapping.
        claims={(source,target,u) for u in left}|{(target,source,u) for u in right}
        need(not occupied.intersection(claims),'overlapping alignment groups')
        occupied.update(claims);alignment_ids.add(al['id']);keys.add(key);used_evidence.update(refs)
    need(set(evidence)==used_evidence,'orphan alignment evidence')
    return {'evidenceCount':len(evidence),'alignmentCount':len(alignment_ids),'publicationAuthorized':False}

def coverage_diagnostics(inventory,edition_ids,coverage):
    """Count literal label collisions only. No pairs are returned or persisted."""
    need(len(edition_ids)==2 and len(set(edition_ids))==2,'audit edition count')
    left,right=edition_ids
    common=set(coverage[left])&set(coverage[right])
    labels={e:set() for e in edition_ids};outside=Counter();empty=Counter();totals=Counter()
    for row in inventory.values():
        ep=row['endpoint'];e=ep['editionId'];b=ep['bookId']
        need(e in labels and b in coverage[e],'inventory coverage')
        totals[e]+=1;empty[e]+=int(row['empty'])
        if b in common:
            label=(b,ep['chapter'],ep['verse'])
            need(label not in labels[e],'duplicate literal label')
            labels[e].add(label)
        else:outside[e]+=1
    shared=len(labels[left]&labels[right])
    return {'editionIds':list(edition_ids),'commonBookIdentities':len(common),
            'editionOnlyBookCounts':{e:len(set(coverage[e])-common) for e in edition_ids},
            'unitCounts':{e:totals[e] for e in edition_ids},
            'unitsOutsideOtherEditionBookCoverage':{e:outside[e] for e in edition_ids},
            'emptyMarkerCounts':{e:empty[e] for e in edition_ids},
            'sameLiteralLabelCount':shared,
            'differentOrUnmatchedLiteralLabelCountsInCommonBooks':{e:len(labels[e])-shared for e in edition_ids},
            'literalLabelCoincidenceIsAlignment':False}

def main():
    try:
        expected=json.loads(reader.EXPECTED.read_text(encoding='utf-8'))
        nav=reader.ReaderNavigation(expected)
        actual=reader.p.build(on_fragment=nav.add_fragment)
        need(actual==expected,'projection changed')
        nav.finalize();audit=nav.audit()
        editions=[e['id'] for e in expected['editions']]
        coverage={e['id']:e['coverageBookIds'] for e in expected['editions']}
        inv=inventory_from_navigation(nav,editions)
        need(len(inv)==audit['references']==39041,'reference totals')
        registry=json.loads(REGISTRY.read_text(encoding='utf-8'))
        validated=validate_registry(registry,inv,editions)
        need(validated['alignmentCount']==validated['evidenceCount']==0,'P9.3.1 requires empty verified registry')
        diagnostics=coverage_diagnostics(inv,editions,coverage)
        need(diagnostics['commonBookIdentities']==27 and sum(diagnostics['emptyMarkerCounts'].values())==18,'coverage totals')
        for e in editions:
            need(diagnostics['unitCounts'][e]==diagnostics['unitsOutsideOtherEditionBookCoverage'][e]+diagnostics['sameLiteralLabelCount']+diagnostics['differentOrUnmatchedLiteralLabelCountsInCommonBooks'][e],'count reconciliation')
        print(json.dumps({'phase':'P9.3.1','mode':'internal_metadata_only','verifiedReferences':len(inv),
                          **diagnostics,**validated,'textPersisted':False,'canonAssignments':0,'versificationAssignments':0},sort_keys=True))
        return 0
    except Exception as exc:
        # No source content or endpoints in diagnostics.
        print('P9.3.1 validation failed ('+type(exc).__name__+'); no corpus persisted',file=sys.stderr);return 1

if __name__=='__main__':sys.exit(main())
