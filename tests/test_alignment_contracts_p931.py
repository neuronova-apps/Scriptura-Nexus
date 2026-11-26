import copy,importlib.util,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('p931',ROOT/'scripts/alignment-contracts-p931.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
A='TXT-A';B='TXT-B';H='a'*64
def ep(e,i,verse,book='LIB-JHN'):
    return {'unitId':'UNIT-'+e+'-'+str(i),'editionId':e,'bookId':book,'chapter':'1','verse':verse,'resourceId':'REC-'+e+'-'+book,
            'sourceLocator':book+'.1.'+verse,'sourceSegmentSha256':H,'textSha256':H}
def fixture():
    a=[ep(A,0,'1a'),ep(A,1,'2-3'),ep(A,2,'4'),ep(A,3,'5','LIB-GEN')]
    b=[ep(B,0,'1a'),ep(B,1,'2'),ep(B,2,'3'),ep(B,3,'4')]
    inv={x['unitId']:{'endpoint':x,'order':i,'empty':x is a[2]} for group in (a,b) for i,x in enumerate(group)}
    return a,b,inv
def mapping(left,right,rel):
    return {'sourceEditionId':A,'targetEditionId':B,'sourceUnits':copy.deepcopy(left),'targetUnits':copy.deepcopy(right),'relationship':rel}
def registry(mp):
    e={'id':'EVD-fixture','sourceRef':'synthetic evidence only','sourceRevision':'fixture-1','sourceSha256':H,'locator':'fixture section','reviewedBy':'test-only','reviewedOn':'2026-01-01','verification':'verified','mapping':copy.deepcopy(mp)}
    return {'schemaVersion':1,'phase':'P9.3.1','scope':'unit','publicationAuthorized':False,'evidence':[e],
            'alignments':[{'id':'ALI-fixture','scope':'unit','verification':'verified','evidenceIds':[e['id']],'mapping':copy.deepcopy(mp)}]}
class Contracts(unittest.TestCase):
    def setUp(self):self.a,self.b,self.inv=fixture()
    def validate(self,r):return m.validate_registry(r,self.inv,[A,B])
    def test_real_registry_empty(self):
        r=json.loads(m.REGISTRY.read_text(encoding='utf-8'))
        self.assertEqual(self.validate(r),{'evidenceCount':0,'alignmentCount':0,'publicationAuthorized':False})
    def test_cardinalities(self):
        for left,right,rel in [(self.a[:1],self.b[:1],'one_to_one'),(self.a[:1],self.b[:2],'one_to_many'),(self.a[:2],self.b[:1],'many_to_one'),(self.a[:2],self.b[:2],'many_to_many')]:
            with self.subTest(rel=rel):self.assertEqual(self.validate(registry(mapping(left,right,rel)))['alignmentCount'],1)
    def test_identical_label_never_creates_mapping(self):
        d=m.coverage_diagnostics(self.inv,[A,B],{A:['LIB-JHN','LIB-GEN'],B:['LIB-JHN']})
        self.assertEqual(d['commonBookIdentities'],1);self.assertEqual(d['sameLiteralLabelCount'],2)
        self.assertEqual(d['differentOrUnmatchedLiteralLabelCountsInCommonBooks'],{A:1,B:2})
        self.assertEqual(d['unitsOutsideOtherEditionBookCoverage'],{A:1,B:0})
        self.assertEqual(d['emptyMarkerCounts'],{A:1,B:0})
        self.assertFalse(d['literalLabelCoincidenceIsAlignment'])
    def test_missing_or_unreviewed_evidence(self):
        for mutate in (lambda r:r['alignments'][0].update(evidenceIds=[]),lambda r:r['evidence'][0].update(verification='pending'),lambda r:r['evidence'][0].update(reviewedOn='invalid'),lambda r:r['evidence'][0].update(locator='')):
            r=registry(mapping(self.a[:1],self.b[:1],'one_to_one'));mutate(r)
            with self.assertRaises(ValueError):self.validate(r)
    def test_evidence_exact_scope(self):
        r=registry(mapping(self.a[:1],self.b[:1],'one_to_one'))
        r['evidence'][0]['mapping']=mapping(self.a[:1],self.b[1:2],'one_to_one')
        with self.assertRaisesRegex(ValueError,'exact mapping'):self.validate(r)
    def test_endpoint_tampering_and_absence(self):
        for k,v in [('verse','9'),('unitId','UNIT-unknown'),('textSha256','b'*64),('resourceId','REC-other'),('sourceLocator','altered')]:
            r=registry(mapping(self.a[:1],self.b[:1],'one_to_one'));r['alignments'][0]['mapping']['sourceUnits'][0][k]=v
            with self.assertRaises(ValueError):self.validate(r)
    def test_empty_and_same_edition_rejected(self):
        with self.assertRaisesRegex(ValueError,'empty marker'):self.validate(registry(mapping(self.a[2:3],self.b[3:4],'one_to_one')))
        mp=mapping(self.a[:1],self.a[1:2],'one_to_one');mp['targetEditionId']=A
        with self.assertRaisesRegex(ValueError,'distinct'):self.validate(registry(mp))
    def test_order_cardinality_and_duplicates(self):
        for mp in [mapping(self.a[:2],self.b[:1],'one_to_one'),mapping(self.a[:2][::-1],self.b[:1],'many_to_one'),mapping([self.a[0],self.a[0]],self.b[:1],'many_to_one')]:
            with self.assertRaises(ValueError):self.validate(registry(mp))
    def test_overlapping_groups_rejected(self):
        r=registry(mapping(self.a[:1],self.b[:1],'one_to_one'))
        other=registry(mapping(self.a[:1],self.b[1:2],'one_to_one'))
        other['evidence'][0]['id']='EVD-other';other['alignments'][0].update(id='ALI-other',evidenceIds=['EVD-other'])
        r['evidence']+=other['evidence'];r['alignments']+=other['alignments']
        with self.assertRaisesRegex(ValueError,'overlapping'):self.validate(r)
    def test_reverse_duplicate_rejected(self):
        r=registry(mapping(self.a[:1],self.b[:1],'one_to_one'))
        mp={'sourceEditionId':B,'targetEditionId':A,'sourceUnits':[self.b[0]],'targetUnits':[self.a[0]],'relationship':'one_to_one'}
        other=registry(mp);other['evidence'][0]['id']='EVD-reverse';other['alignments'][0].update(id='ALI-reverse',evidenceIds=['EVD-reverse'])
        r['evidence']+=other['evidence'];r['alignments']+=other['alignments']
        with self.assertRaisesRegex(ValueError,'duplicate alignment'):self.validate(r)
    def test_publication_or_token_scope_rejected(self):
        for fields in ({'publicationAuthorized':True},{'scope':'token'},{'text':'not allowed'}):
            r=registry(mapping(self.a[:1],self.b[:1],'one_to_one'));r.update(fields)
            with self.assertRaises(ValueError):self.validate(r)
    def test_orphan_evidence_rejected(self):
        r=registry(mapping(self.a[:1],self.b[:1],'one_to_one'));r['alignments']=[]
        with self.assertRaisesRegex(ValueError,'orphan'):self.validate(r)
if __name__=='__main__':unittest.main()
