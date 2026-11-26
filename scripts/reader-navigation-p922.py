"""Internal exact-reference navigation; no biblical text is written or printed."""
import importlib.util,json,pathlib,sys
from collections import Counter
from copy import deepcopy
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('p913_reader',ROOT/'scripts/project-textual-p913.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
EXPECTED=ROOT/'docs/P9/proyeccion-ediciones-p913.json'

class ReaderNavigation:
    def __init__(self,report):
        p.verify_report(report)
        self._editions={e['id']:tuple(e['coverageBookIds']) for e in report['editions']}
        self._fragments={(m['editionId'],f['bookId']):f for m in deepcopy(report['corpusManifests']) for f in m['fragments']}
        self._books={}
        self._ready=False
        self._orders={}
        self._ids=set()
        self._reference_count=0
        self._empty_count=0
        self._range_count=0

    def add_fragment(self,edition,book,units):
        key=(edition,book)
        p.require(not self._ready and key in self._fragments and key not in self._books,'fragment identity')
        f=self._fragments[key]
        p.require(len(units)==f['unitCount'] and p.digest_units(units)==f['projectionSha256'],'fragment fingerprint')
        p.require(bool(units),'empty fragment')
        # Source order is checked explicitly, not sorted numerically.
        start=self._orders.get(edition,0)
        p.require(self._editions[edition][sum(e==edition for e,_ in self._books)]==book,'book source order')
        chapters={};records=[];seen=set();ids=set()
        for i,u in enumerate(units):
            ch,v=u['chapter'],u['verse']
            p.require(u['editionId']==edition and u['bookId']==book and u['resourceId']==f['resourceId'] and u['order']==start+i,'unit provenance')
            p.require(isinstance(ch,str) and p.re.fullmatch(r'[1-9][0-9]*',ch) and isinstance(v,str) and p.VERSE.fullmatch(v),'unit label')
            p.require((ch,v) not in seen and u['id'] not in self._ids and u['id'] not in ids,'duplicate reference')
            p.require(u['id']==p.unit_id(edition,book,ch,v,u['sourceLocator']) and u['textSha256']==p.sha(u['text'].encode('utf-8')),'unit integrity')
            seen.add((ch,v));ids.add(u['id'])
            row={k:u[k] for k in ('id','editionId','bookId','chapter','verse','order','resourceId','sourceLocator','sourceSegmentSha256','textSha256')}
            row['empty']=not u['text']
            row['range']='-' in v or '–' in v
            chapters.setdefault(ch,{})[v]=len(records)
            records.append(row)
        empty=[u['sourceLocator'] for u in records if u['empty']]
        ranges=sum(u['range'] for u in records)
        p.require(len(chapters)==f['chapters'] and empty==f['emptyUnitLocators'] and len(empty)==f['emptyUnitCount'] and ranges==f['rangeMarkers'],'reference coverage')
        self._books[key]=(chapters,records)
        self._orders[edition]=start+len(records)
        self._ids.update(ids)
        self._reference_count+=len(records);self._empty_count+=len(empty);self._range_count+=ranges

    def finalize(self):
        p.require(not self._ready and set(self._books)==set(self._fragments),'incomplete coverage')
        self._ready=True

    def _book(self,edition,book):
        p.require(self._ready,'navigation not finalized')
        if edition not in self._editions:return 'edition_unavailable',None
        if book not in self._editions[edition]:return 'book_outside_coverage',None
        return 'available',self._books[(edition,book)]

    def books(self,edition):
        p.require(self._ready,'navigation not finalized')
        if edition not in self._editions:return {'status':'edition_unavailable'}
        return {'status':'available','books':list(self._editions[edition])}

    def chapters(self,edition,book):
        status,data=self._book(edition,book)
        return {'status':status,'chapters':list(data[0])} if data is not None else {'status':status}

    def verses(self,edition,book,chapter):
        status,data=self._book(edition,book)
        if data is None:return {'status':status}
        if not isinstance(chapter,str) or chapter not in data[0]:return {'status':'chapter_not_found'}
        return {'status':'available','verses':list(data[0][chapter])}

    def locate(self,edition,book,chapter,verse):
        status,data=self._book(edition,book)
        if data is None:return {'status':status}
        chapters,records=data
        if not isinstance(chapter,str) or chapter not in chapters:return {'status':'chapter_not_found'}
        if not isinstance(verse,str) or verse not in chapters[chapter]:return {'status':'reference_not_found'}
        i=chapters[chapter][verse];row=records[i]
        def neighbor(j):
            if j<0 or j>=len(records):return None
            return {k:records[j][k] for k in ('chapter','verse','id')}
        return {'status':'empty_marker' if row['empty'] else 'verified_fragment',
                'reference':dict(row),'previous':neighbor(i-1),'next':neighbor(i+1),
                'publicationEnabled':False}

    def audit(self):
        p.require(self._ready,'navigation not finalized')
        # Exhaustive round-trip, without exposing any source text.
        statuses=Counter();chapters=0
        for (edition,book),(index,records) in self._books.items():
            chapters+=len(index)
            for i,row in enumerate(records):
                found=self.locate(edition,book,row['chapter'],row['verse'])
                p.require(found['reference']==row,'roundtrip mismatch')
                p.require((found['previous'] or {}).get('id')==(records[i-1]['id'] if i else None),'previous mismatch')
                p.require((found['next'] or {}).get('id')==(records[i+1]['id'] if i+1<len(records) else None),'next mismatch')
                statuses[found['status']]+=1
        p.require(statuses['empty_marker']==self._empty_count and sum(statuses.values())==self._reference_count,'audit counts')
        return {'phase':'P9.2.2','mode':'in_memory_metadata_only','editions':len(self._editions),
                'bookFragments':len(self._books),'chaptersByEdition':chapters,
                'references':self._reference_count,'emptyMarkers':self._empty_count,
                'rangeMarkers':self._range_count,'roundTrips':sum(statuses.values()),
                'publicationEnabled':False,'textPersisted':False,'alignmentsCreated':0}

def main():
    try:
        expected=json.loads(EXPECTED.read_text(encoding='utf-8'))
        nav=ReaderNavigation(expected)
        actual=p.build(on_fragment=nav.add_fragment)
        p.require(actual==expected,'projection manifest mismatch')
        nav.finalize()
        p.require(nav.books('TXT-UNKNOWN')['status']=='edition_unavailable','edition absence')
        p.require(nav.chapters('TXT-SBLGNT-V1-2','LIB-GEN')['status']=='book_outside_coverage','book absence')
        p.require(nav.locate('TXT-RV1909','LIB-NUM','12','16')['status']=='empty_marker','empty reference')
        p.require(nav.locate('TXT-RV1909','LIB-GEN','999999','1')['status']=='chapter_not_found','chapter absence')
        p.require(nav.locate('TXT-RV1909','LIB-GEN','1','999999')['status']=='reference_not_found','reference absence')
        result=nav.audit()
        p.require(result['references']==39041 and result['emptyMarkers']==18 and result['bookFragments']==93,'baseline totals')
        print(json.dumps(result,sort_keys=True));return 0
    except Exception as exc:
        # Never echo exception details that could contain corpus bytes.
        print('P9.2.2 validation failed ('+type(exc).__name__+'); no corpus persisted',file=sys.stderr);return 1

if __name__=='__main__':sys.exit(main())
