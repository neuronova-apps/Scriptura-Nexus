import copy,hashlib,importlib.util,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('audit_p84',ROOT/'scripts/audit-lexicon-p84.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
class AuditTest(unittest.TestCase):
    def manifest(self): return json.loads(mod.MANIFEST.read_text())
    def test_manifest(self): self.assertEqual(len(mod.validate(self.manifest())),7)
    def test_gate(self):
        for key in ('admission','publication'):
            m=self.manifest();m[key]=True
            with self.assertRaises(ValueError): mod.validate(m)
    def test_scope(self):
        for field,value in [('allowedComponents',['sentidos_lexicos']),('path','../secret'),('repository','unknown/repo')]:
            m=self.manifest();m['files'][0][field]=value
            with self.assertRaises(ValueError): mod.validate(m)
    def test_integrity(self):
        b=b'abc';f={'bytes':3,'gitBlobSha1':hashlib.sha1(b'blob 3\0abc').hexdigest(),'sha256':hashlib.sha256(b).hexdigest()}
        self.assertEqual(mod.check_bytes(b,f),f['sha256'])
        with self.assertRaises(ValueError): mod.check_bytes(b'abd',f)
    def test_xml(self):
        s='<index><w aug="1">x</w><w aug="2">y</w><w aug="2">z</w></index>'
        self.assertEqual(mod.xml_stats(s,'xml-aug')['duplicateRows'],1)
        with self.assertRaises(ValueError): mod.xml_stats('<!DOCTYPE x><x/>','xml-aug')
    def test_step(self):
        r=mod.table_stats('Online Bible permission CC BY\neStrong#\tdStrong\tMeaning\nH0001\tH0001\tprivate','step-tsv')
        self.assertEqual(r['dataRows'],1);self.assertTrue(r['headerSignals']['permission']);self.assertNotIn('private',json.dumps(r))
    def test_dodson(self):
        r=mod.table_stats("\"Strong's\"\t\"Goodrick-Kohlenberger\"\t\"Greek Word\"\t\"English Definition (brief)\"\t\"English Definition (longer)\"\n\"0001\"\t\"0001\"\t\"a)/lfa\"\t\"private\"\t\"private\"", 'dodson-tsv')
        self.assertEqual(r['uniqueStrongKeys'],1);self.assertEqual(r['headerColumns'],5);self.assertNotIn('private',json.dumps(r))
if __name__=='__main__': unittest.main()
