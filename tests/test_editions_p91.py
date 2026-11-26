import copy,importlib.util,io,json,pathlib,unittest,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('audit',ROOT/'scripts/audit-editions-p91.py')
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class TestAudit(unittest.TestCase):
 def setUp(self):self.p=json.loads(m.MANIFEST.read_text())
 def test_manifest(self):m.validate(self.p)
 def test_publication(self):
    for field in ('publication','admission'):
     c=copy.deepcopy(self.p);c[field]=True
     with self.assertRaises(ValueError):m.validate(c)
 def test_source(self):
    self.p['candidates'][0]['file']['url']='https://example.com'
    with self.assertRaises(ValueError):m.validate(self.p)
 def test_greek_identity(self):
    self.p['candidates'][1]['files'][0]['gitBlobSha1']='0'*40
    with self.assertRaises(ValueError):m.validate(self.p)
 def test_greek_markers(self):
    b='<book id="Mt"><p><verse-number id="Matthew 1:1">1</verse-number><w>λόγος</w><suffix>.</suffix><verse-number id="Matthew 1:2">2</verse-number></p></book>'.encode()
    r=m.greek(b);self.assertEqual(r['wordElements'],1);self.assertEqual(r['verseMarkers'],2);self.assertEqual(r['emptyVerseMarkers'],1)
 def test_greek_unsafe(self):
    with self.assertRaises(ValueError):m.greek(b'<!DOCTYPE book><book/>')
 def test_usfm_range(self):
    b=b'\\id GEN example\n\\c 1\n\\v 1 first\n\\v 2-3 range\n\\v 4a suffix\n'
    book,r=m.usfm_member(b);self.assertEqual(book,'GEN');self.assertEqual(r['verseMarkers'],3);self.assertEqual(r['rangeMarkers'],1)
 def test_usfm_duplicate(self):
    with self.assertRaises(ValueError):m.usfm_member(b'\\id GEN\n\\c 1\n\\v 1 first\n\\v 1 second\n')
 def test_zip_traversal(self):
    b=io.BytesIO()
    with zipfile.ZipFile(b,'w') as z:z.writestr('../test.usfm','bad')
    with self.assertRaises(ValueError):m.audit_zip(b.getvalue())
 def test_zip_missing_books(self):
    b=io.BytesIO()
    with zipfile.ZipFile(b,'w') as z:z.writestr('GEN.usfm','\\id GEN\n\\c 1\n\\v 1 test')
    with self.assertRaises(ValueError):m.audit_zip(b.getvalue())
if __name__=='__main__':unittest.main()
