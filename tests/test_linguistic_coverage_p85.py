import copy,importlib.util,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('audit',ROOT/'scripts/audit-linguistic-coverage-p85.py')
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class Tests(unittest.TestCase):
 def setUp(self):
    self.c=json.loads(m.MANIFEST.read_text())
    self.xml=b'<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace"><osisText osisIDWork="OSHB"><header><work osisWork="OSHB"><rights>Creative Commons Attribution 4.0</rights></work><work osisWork="WLC"><rights>Public Domain</rights></work></header><div type="book" osisID="Exod"><chapter osisID="Exod.1"><verse osisID="Exod.1.1"><w lemma="a" morph="b">word</w><note><w>variant</w></note></verse></chapter></div></osisText></osis>'
 def test_manifest(self):m.validate(self.c)
 def test_gate(self):
    for field in ('admission','publication'):
      c=copy.deepcopy(self.c);c[field]=True
      with self.assertRaises(ValueError):m.validate(c)
 def test_candidate_scope(self):
    c=copy.deepcopy(self.c);c['files'][0]['allowedComponents']=['texto_wlc']
    with self.assertRaises(ValueError):m.validate(c)
 def test_pinned_identity(self):
    c=copy.deepcopy(self.c);c['files'][0]['gitBlobSha1']='0'*40
    with self.assertRaises(ValueError):m.validate(c)
 def test_raw_counts(self):
    r=m.stats(self.xml,'Exod');self.assertEqual(r['rawWordElements'],2);self.assertEqual(r['rawWordsWithLemmaAttribute'],1);self.assertEqual(r['noteElements'],1)
 def test_wrong_book(self):
    with self.assertRaises(ValueError):m.stats(self.xml,'Lev')
 def test_rights(self):
    with self.assertRaises(ValueError):m.stats(self.xml.replace(b'Public Domain',b'Unknown'),'Exod')
 def test_unsafe(self):
    with self.assertRaises(ValueError):m.stats(b'<!DOCTYPE x><x/>','Exod')
if __name__=='__main__':unittest.main()
