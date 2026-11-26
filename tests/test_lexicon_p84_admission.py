import copy,importlib.util,json,pathlib,unittest,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('admission',ROOT/'scripts/review-lexicon-admission-p84.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Tests(unittest.TestCase):
    def setUp(self):
        self.manifest=json.loads(m.MANIFEST.read_text());self.prior=json.loads(m.audit.MANIFEST.read_text())
    def test_scope(self):
        self.assertEqual([d['id'] for d in m.verified_decisions(self.manifest,self.prior)],['LING-015','LING-016','LING-017','LING-018'])
    def test_no_publication(self):
        self.manifest['publication']=True
        with self.assertRaises(ValueError):m.verified_decisions(self.manifest,self.prior)
    def test_no_admission_of_deferred(self):
        self.manifest['decisions'][6]['allowedComponents']=['identificadores_lexicos']
        with self.assertRaises(ValueError):m.verified_decisions(self.manifest,self.prior)
    def test_no_permission_expansion(self):
        self.manifest['decisions'][2]['selectors'].append('index/w/@other')
        with self.assertRaises(ValueError):m.verified_decisions(self.manifest,self.prior)
    def test_hash_immutable(self):
        for field in ('sha256','commit','path'):
            d=copy.deepcopy(self.manifest);d['decisions'][2][field]='bad'
            with self.assertRaises(ValueError):m.verified_decisions(d,self.prior)
    def test_license_evidence_immutable(self):
        self.manifest['decisions'][3]['licenseEvidence'][0]['sha256']='0'*64
        with self.assertRaises(ValueError):m.verified_decisions(self.manifest,self.prior)
    def test_xml_reject(self):
        with self.assertRaises(ValueError):m.root_xml(b'<!DOCTYPE x><x/>','index')
    def test_plain_def(self):
        self.assertTrue(m.plain_def(ET.fromstring('<def xmlns="http://openscriptures.github.com/morphhb/namespace">test</def>')))
        self.assertFalse(m.plain_def(ET.fromstring('<def xmlns="http://openscriptures.github.com/morphhb/namespace">test<foreign>excluded</foreign></def>')))
    def test_duplicate_id(self):
        with self.assertRaises(ValueError):m.unique_ids([ET.fromstring('<entry id="x"/>'),ET.fromstring('<entry id="x"/>')])
if __name__=='__main__':unittest.main()
