"""Internal comparison of source-native units. Never publish or log corpus text."""
import importlib.util,json,pathlib,sys
from collections import Counter
from copy import deepcopy
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('alignment_p931',ROOT/'scripts/alignment-contracts-p931.py')
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
need=a.need

class ComparisonEngine:
    def __init__(self,nav,report,registry,texts):
        # The caller must supply the finalized, source-pinned P9.2.2 navigation.
        self.nav=nav
        self.editions={e['id']:deepcopy(e) for e in report['editions']}
        self.inventory=a.inventory_from_navigation(nav,list(self.editions))
        a.validate_registry(registry,self.inventory,list(self.editions))
        need(set(texts)==set(self.inventory),'text inventory mismatch')
        for uid,row in self.inventory.items():
            text=texts[uid]
            need(isinstance(text,str) and a.reader.p.sha(text.encode('utf-8'))==row['endpoint']['textSha256'] and (not text)==row['empty'],'text fingerprint mismatch')
        self._texts=dict(texts)
        self._evidence={e['id']:deepcopy(e) for e in registry['evidence']}
        self._groups={}
        for al in deepcopy(registry['alignments']):
            m=al['mapping'];left=m['sourceUnits'];right=m['targetUnits']
            for origins,targets,src,dst in [(left,right,m['sourceEditionId'],m['targetEditionId']),(right,left,m['targetEditionId'],m['sourceEditionId'])]:
                kind=a.KINDS[(len(origins)>1,len(targets)>1)]
                for ep in origins:self._groups[(ep['unitId'],dst)]=(al,origins,targets,kind,src,dst)

    def _locate(self,edition,ref):
        if not isinstance(edition,str) or edition not in self.editions:return {'status':'edition_unavailable'}
        if not a.exact(ref,('bookId','chapter','verse')) or not all(isinstance(v,str) for v in ref.values()):
            return {'status':'invalid_reference'}
        found=self.nav.locate(edition,ref['bookId'],ref['chapter'],ref['verse'])
        if 'reference' not in found:return {'status':found['status']}
        return {'status':found['status'],'endpoint':a.endpoint(found['reference'])}

    def _unit(self,ep):
        # Private in-process result only. No serialization, persistence or HTTP interface.
        uid=ep['unitId'];return {'endpoint':deepcopy(ep),'text':self._texts[uid],'empty':self.inventory[uid]['empty']}

    def _edition(self,e):
        meta=self.editions.get(e) if isinstance(e,str) else None
        return None if meta is None else {k:deepcopy(meta[k]) for k in ('id','name','language','version','provider','licenseRef','attribution','sourceRevision')}

    def compare(self,source_edition,source_ref,target_edition,target_ref=None):
        """One source-native anchor, optional independently selected target.
        A literal-label probe is diagnostic only and never selects target text.
        Verified groups can resolve a target only when the caller has not chosen one,
        or when the chosen target belongs to that exact group.
        """
        result={'status':'not_aligned','publicationAuthorized':False,'sourceEdition':self._edition(source_edition),
                'targetEdition':self._edition(target_edition),'source':None,'target':None,'alignment':None,
                'literalLabelProbe':None,'comparison':None}
        if not result['sourceEdition'] or not result['targetEdition']:
            result['status']='edition_unavailable';return result
        if source_edition==target_edition:
            result['status']='same_edition';return result
        s=self._locate(source_edition,source_ref);result['source']=deepcopy(s)
        t=self._locate(target_edition,target_ref) if target_ref is not None else None
        if t is not None:
            result['target']=deepcopy(t)
            if 'endpoint' in t:result['target']['unit']=self._unit(t['endpoint'])
        if 'endpoint' not in s:
            result['status']='source_unavailable';return result
        result['source']['unit']=self._unit(s['endpoint'])
        # Probe only metadata of same literal label, even when an explicit target differs.
        probe=self._locate(target_edition,source_ref)
        result['literalLabelProbe']={'status':probe['status'],'isAlignment':False}
        if s['status']=='empty_marker':
            result['status']='source_empty_marker';return result
        if t is not None:
            if 'endpoint' not in t:result['status']='target_unavailable';return result
            if t['status']=='empty_marker':result['status']='target_empty_marker';return result
        group=self._groups.get((s['endpoint']['unitId'],target_edition))
        if group is None:
            result['status']='not_aligned'
            return result
        al,left,right,kind,_,_=group
        if t is not None and t['endpoint']['unitId'] not in {ep['unitId'] for ep in right}:
            result['status']='target_outside_verified_group';return result
        result['status']='verified_alignment'
        result['alignment']={'id':al['id'],'relationship':kind,'verification':'verified',
                             'evidence':[deepcopy(self._evidence[e]) for e in al['evidenceIds']]}
        lhs=[self._unit(ep) for ep in left];rhs=[self._unit(ep) for ep in right]
        # Equality is literal unit-by-unit, not semantic or doctrinal. No token alignment.
        same_language=result['sourceEdition']['language']==result['targetEdition']['language']
        comparison={'sourceUnits':lhs,'targetUnits':rhs,'sameLanguage':same_language,
                    'literalTextEquality':([u['text'] for u in lhs]==[u['text'] for u in rhs]) if same_language else None,
                    'semanticEquivalence':None,'tokenAlignment':None}
        result['comparison']=comparison
        if t is None:
            result['target']={'status':'verified_group','unitCount':len(rhs)}
        return result

def build_engine():
    expected=json.loads(a.reader.EXPECTED.read_text(encoding='utf-8'))
    nav=a.reader.ReaderNavigation(expected);texts={}
    def accept(edition,book,units):
        nav.add_fragment(edition,book,units)
        for u in units:
            need(u['id'] not in texts,'duplicate text unit')
            texts[u['id']]=u['text']
    actual=a.reader.p.build(on_fragment=accept)
    need(actual==expected,'projection changed')
    nav.finalize()
    registry=json.loads(a.REGISTRY.read_text(encoding='utf-8'))
    return ComparisonEngine(nav,expected,registry,texts)

def audit_unaligned(engine):
    """Audit both directions against the real empty registry. Output aggregate counts only."""
    need(len(engine.editions)==2 and not engine._groups,'P9.3.2 real registry must remain empty')
    editions=list(engine.editions);counts={e:Counter() for e in editions};probes={e:Counter() for e in editions}
    for row in engine.inventory.values():
        ep=row['endpoint'];src=ep['editionId'];dst=next(e for e in editions if e!=src)
        ref={k:ep[k] for k in ('bookId','chapter','verse')}
        result=engine.compare(src,ref,dst)
        need(result['alignment'] is None and result['comparison'] is None and result['target'] is None and result['publicationAuthorized'] is False,'unverified alignment or publication')
        need(result['status']==('source_empty_marker' if row['empty'] else 'not_aligned'),'source state')
        need(result['source']['endpoint']==ep,'source endpoint drift')
        counts[src][result['status']]+=1
        probe=result['literalLabelProbe'];need(probe['isAlignment'] is False,'literal label aligned')
        probes[src][probe['status']]+=1
    total=sum(sum(c.values()) for c in counts.values())
    need(total==len(engine.inventory)==39041,'audit totals')
    for e in editions:
        need(probes[e]['verified_fragment']+probes[e]['empty_marker']==7937,'literal overlap count')
    need(sum(c['source_empty_marker'] for c in counts.values())==18,'empty markers')
    need(probes['TXT-RV1909']['book_outside_coverage']==23145,'coverage')
    return {'phase':'P9.3.2','mode':'private_in_memory','queries':total,
            'queryStatusByEdition':{e:dict(c) for e,c in counts.items()},
            'literalProbeStatusByEdition':{e:dict(c) for e,c in probes.items()},
            'verifiedAlignments':0,'automaticAlignments':0,'textPersisted':False,'publicationAuthorized':False}

def main():
    try:
        result=audit_unaligned(build_engine())
        print(json.dumps(result,sort_keys=True));return 0
    except Exception as exc:
        # Never serialize private results or echo arbitrary exceptions.
        print('P9.3.2 validation failed ('+type(exc).__name__+'); no corpus persisted',file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
