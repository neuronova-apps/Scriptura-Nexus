import copy,importlib.util,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('p912',ROOT/'scripts/validate-editions-p912.py')
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
C=json.loads((ROOT/'docs/P9/candidatos-ediciones-p91.json').read_text())
class TestAdmissionP912(unittest.TestCase):
 def setUp(self):self.d=json.loads(m.ADMISSION.read_text())
 def test_manifest_valid(self):m.validate_manifest(self.d,C)
 def test_only_two_admissions(self):
    self.assertEqual([x['id'] for x in self.d['decisions']],['ED-C01','ED-C02'])
 def test_publication_blocked(self):
    x=copy.deepcopy(self.d);x['publication']['authorized']=True
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_no_persistence(self):
    x=copy.deepcopy(self.d);x['publication']['publicCorpusPersisted']=True
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_rv_hash_required(self):
    x=copy.deepcopy(self.d);x['decisions'][0]['sourceArchive']['files'][0]['sha256']=None
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_rv_archive_hash_fixed(self):
    x=copy.deepcopy(self.d);x['decisions'][0]['sourceArchive']['sha256']='0'*64
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_greek_hash_required(self):
    x=copy.deepcopy(self.d);x['decisions'][1]['sourceFiles'][0]['sha256']=''
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_sbl_version_fixed(self):
    x=copy.deepcopy(self.d);x['decisions'][1]['version']='v1.1'
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_no_inferred_canon(self):
    x=copy.deepcopy(self.d);x['decisions'][0]['scope']['canonId']='CAN-01'
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_no_alignment(self):
    x=copy.deepcopy(self.d);x['decisions'][1]['scope']['alignmentAllowed']=True
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_f19_not_expanded(self):
    x=copy.deepcopy(self.d);x['deferred'][0]['status']='admitido'
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_license_conditions(self):
    x=copy.deepcopy(self.d);x['decisions'][1]['license']['type']='CC BY-SA'
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
 def test_source_count_tampering(self):
    x=copy.deepcopy(self.d);x['decisions'][1]['totals']['books']=28
    with self.assertRaises(ValueError):m.validate_manifest(x,C)
if __name__=='__main__':unittest.main()
