import copy,importlib.util,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('p932',ROOT/'scripts/comparison-engine-p932.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
A='TXT-A';B='TXT-B'
def ref(verse='1',book='LIB-JHN',chapter='1'):
    return {'bookId':book,'chapter':chapter,'verse':verse}
def fixture():
    p=m.a.reader.p
    rows={}
    texts={}
    for e,items in [(A,[('LIB-JHN','1','1','A'),('LIB-JHN','1','2-3','B'),('LIB-JHN','1','4',''),('LIB-GEN','1','1','G')]),(B,[('LIB-JHN','1','1','α'),('LIB-JHN','1','2','β'),('LIB-JHN','1','3','γ'),('LIB-JHN','1','5','δ'),('LIB-JHN','2','1','ε')])]:
        for i,(book,ch,v,text) in enumerate(items):
            u=p.make_unit(e,book,ch,v,i,text,'REC-'+e+'-'+book,book+'.'+ch+'.'+v,p.sha(text.encode()))
            rows[(e,book,ch,v)]={k:x for k,x in u.items() if k!='text'}
            texts[u['id']]=text
    class Nav:
        def books(self,e):return {'status':'available','books':list(dict.fromkeys(k[1] for k in rows if k[0]==e))}
        def chapters(self,e,b):return {'chapters':list(dict.fromkeys(k[2] for k in rows if k[:2]==(e,b)))}
        def verses(self,e,b,c):return {'verses':[k[3] for k in rows if k[:3]==(e,b,c)]}
        def locate(self,e,b,c,v):
            if b not in self.books(e)['books']:return {'status':'book_outside_coverage'}
            if c not in self.chapters(e,b)['chapters']:return {'status':'chapter_not_found'}
            row=rows.get((e,b,c,v))
            if row is None:return {'status':'reference_not_found'}
            return {'status':'verified_fragment' if texts[row['id']] else 'empty_marker','reference':copy.deepcopy(row)}
    def ed(e,lang):
        return {'id':e,'name':e,'language':lang,'version':'fixture','provider':'test','licenseRef':'LIC-test','attribution':'test','sourceRevision':{'commit':'a'*40}}
    report={'editions':[ed(A,'spa'),ed(B,'grc')]}
    reg={'schemaVersion':1,'phase':'P9.3.1','scope':'unit','publicationAuthorized':False,'evidence':[],'alignments':[]}
    return Nav(),report,reg,texts
def aligned(nav,reg,left,right,kind):
    def ep(e,v):return m.a.endpoint(nav.locate(e,'LIB-JHN','1',v)['reference'])
    mapping={'sourceEditionId':A,'targetEditionId':B,'sourceUnits':[ep(A,v) for v in left],'targetUnits':[ep(B,v) for v in right],'relationship':kind}
    ev={'id':'EVD-fixture','sourceRef':'private synthetic evidence','sourceRevision':'test','sourceSha256':'a'*64,'locator':'test','reviewedBy':'test','reviewedOn':'2026-01-01','verification':'verified','mapping':copy.deepcopy(mapping)}
    reg['evidence'].append(ev);reg['alignments'].append({'id':'ALI-fixture','scope':'unit','verification':'verified','evidenceIds':[ev['id']],'mapping':mapping})
class Comparison(unittest.TestCase):
    def engine(self,group=None,language=None):
        n,r,g,t=fixture()
        if language:r['editions'][1]['language']=language
        if group:aligned(n,g,*group)
        return m.ComparisonEngine(n,r,g,t)
    def test_literal_label_is_not_alignment(self):
        x=self.engine().compare(A,ref(),B)
        self.assertEqual(x['status'],'not_aligned');self.assertIsNone(x['target']);self.assertIsNone(x['comparison'])
        self.assertEqual(x['literalLabelProbe'],{'status':'verified_fragment','isAlignment':False})
    def test_explicit_independent_selection(self):
        x=self.engine().compare(A,ref(),B,ref('2'))
        self.assertEqual(x['status'],'not_aligned');self.assertEqual(x['source']['unit']['text'],'A');self.assertEqual(x['target']['unit']['text'],'β')
        self.assertIsNone(x['alignment']);self.assertIsNone(x['comparison'])
    def test_missing_chapter_book_reference_distinguished(self):
        e=self.engine()
        for selection,status in [(ref(book='LIB-GEN'),'book_outside_coverage'),(ref(chapter='9'),'chapter_not_found'),(ref('99'),'reference_not_found')]:
            x=e.compare(A,ref(),B,selection);self.assertEqual(x['status'],'target_unavailable');self.assertEqual(x['target']['status'],status)
        self.assertEqual(e.compare(A,ref('99'),B)['status'],'source_unavailable')
    def test_missing_and_empty_not_equal(self):
        e=self.engine();self.assertEqual(e.compare(A,ref('4'),B)['status'],'source_empty_marker')
        x=e.compare(B,ref('5'),A,ref('4'));self.assertEqual(x['status'],'target_empty_marker');self.assertTrue(x['target']['unit']['empty'])
        self.assertEqual(e.compare(B,ref('5'),A,ref('99'))['target']['status'],'reference_not_found')
    def test_unknown_same_and_invalid_selection(self):
        e=self.engine();self.assertEqual(e.compare(A,ref(),A)['status'],'same_edition')
        self.assertEqual(e.compare(A,ref(),'TXT-unknown')['status'],'edition_unavailable')
        self.assertEqual(e.compare(A,{'chapter':1},B)['source']['status'],'invalid_reference')
    def test_one_to_many_and_reverse(self):
        e=self.engine((['2-3'],['2','3'],'one_to_many'))
        x=e.compare(A,ref('2-3'),B)
        self.assertEqual(x['status'],'verified_alignment');self.assertEqual(x['alignment']['relationship'],'one_to_many')
        self.assertEqual([u['endpoint']['verse'] for u in x['comparison']['targetUnits']],['2','3'])
        y=e.compare(B,ref('3'),A);self.assertEqual(y['alignment']['relationship'],'many_to_one')
        self.assertEqual(y['comparison']['targetUnits'][0]['endpoint']['verse'],'2-3')
    def test_one_to_one_and_many_to_many(self):
        for group in [(['1'],['1'],'one_to_one'),(['1','2-3'],['1','2'],'many_to_many')]:
            e=self.engine(group);x=e.compare(A,ref(),B)
            self.assertEqual(x['alignment']['relationship'],group[2]);self.assertEqual(len(x['comparison']['sourceUnits']),len(group[0]))
    def test_target_outside_verified_group_is_not_substituted(self):
        e=self.engine((['2-3'],['2','3'],'one_to_many'))
        x=e.compare(A,ref('2-3'),B,ref('5'));self.assertEqual(x['status'],'target_outside_verified_group')
        self.assertEqual(x['target']['unit']['text'],'δ');self.assertIsNone(x['comparison'])
        self.assertEqual(e.compare(A,ref('2-3'),B,ref('3'))['status'],'verified_alignment')
    def test_no_cross_language_equality_or_semantic_claim(self):
        x=self.engine((['1'],['1'],'one_to_one')).compare(A,ref(),B)
        self.assertFalse(x['comparison']['sameLanguage']);self.assertIsNone(x['comparison']['literalTextEquality'])
        self.assertIsNone(x['comparison']['semanticEquivalence']);self.assertIsNone(x['comparison']['tokenAlignment'])
        y=self.engine((['1'],['1'],'one_to_one'),'spa').compare(A,ref(),B)
        self.assertTrue(y['comparison']['sameLanguage']);self.assertFalse(y['comparison']['literalTextEquality'])
    def test_integrity_of_texts_and_registry(self):
        n,r,g,t=fixture();t[next(iter(t))]='altered'
        with self.assertRaisesRegex(ValueError,'fingerprint'):m.ComparisonEngine(n,r,g,t)
        n,r,g,t=fixture();t.pop(next(iter(t)))
        with self.assertRaisesRegex(ValueError,'inventory'):m.ComparisonEngine(n,r,g,t)
        n,r,g,t=fixture();g['publicationAuthorized']=True
        with self.assertRaises(ValueError):m.ComparisonEngine(n,r,g,t)
    def test_detached_result_and_attribution(self):
        e=self.engine((['1'],['1'],'one_to_one'));x=e.compare(A,ref(),B)
        x['source']['unit']['text']='changed';x['alignment']['evidence'][0]['locator']='changed';x['comparison']['sourceUnits'][0]['endpoint']['verse']='changed'
        y=e.compare(A,ref(),B);self.assertEqual(y['source']['unit']['text'],'A');self.assertEqual(y['alignment']['evidence'][0]['locator'],'test')
        self.assertEqual(y['comparison']['sourceUnits'][0]['endpoint']['verse'],'1');self.assertEqual(y['sourceEdition']['licenseRef'],'LIC-test')
        self.assertFalse(y['publicationAuthorized'])
if __name__=='__main__':unittest.main()
