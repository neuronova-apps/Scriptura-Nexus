import importlib.util,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('p913',ROOT/'scripts/project-textual-p913.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
def usfm(body):return ('\\id GEN Génesis\n\\h Génesis\n\\c 1\n'+body).encode('utf-8')
def xml(body):return ('<?xml version="1.0" encoding="UTF-8"?><book id="Jn"><title>ΚΑΤΑ ΙΩΑΝΝΗΝ</title><p>'+body+'</p></book>').encode('utf-8')
class TestUSFMProjection(unittest.TestCase):
 def test_preserves_text_unicode_and_source_labels(self):
  source=usfm('\\p\n\\v 1 En el principio \\add verdadero\\add* Dios \\w creó|lemma="bara" strong="H1254"\\w*.\n\\f + \\fr 1:1 \\ft nota excluida\\f*\n\\v 2 Y dijo: «Sea la luz».\n')
  units,metrics=p.parse_usfm_units(source,'GEN',book_id='LIB-GEN')
  self.assertEqual([(x['chapter'],x['verse']) for x in units],[('1','1'),('1','2')])
  self.assertEqual(units[0]['text'],'En el principio verdadero Dios creó.')
  self.assertNotIn('nota excluida',units[0]['text'])
  self.assertEqual(metrics['unitCount'],2);self.assertEqual(metrics['excluded']['footnotes'],1)
 def test_preserves_suffix_and_range_labels(self):
  units,metrics=p.parse_usfm_units(usfm('\\v 1a Texto A.\n\\v 2-3 Texto B.\n'),'GEN')
  self.assertEqual([x['verse'] for x in units],['1a','2-3']);self.assertEqual(metrics['rangeMarkers'],1)
  self.assertEqual(metrics['emptyUnitLocators'],['GEN.1.1a'])
 def test_preserves_empty_marker_without_inventing_text(self):
  units,metrics=p.parse_usfm_units(usfm('\\v 1 \\f + \\ft nota\\f*\\n'),'GEN')
  self.assertEqual(units[0]['text'],'');self.assertEqual(metrics['emptyUnitLocators'],['GEN.1.1'])
 def test_rejects_verse_before_chapter_and_duplicate(self):
  with self.assertRaises(ValueError):p.parse_usfm_units(b'\\id GEN\n\\v 1 texto\n','GEN')
  with self.assertRaises(ValueError):p.parse_usfm_units(usfm('\\v 1 uno\n\\v 1 dos\n'),'GEN')
 def test_rejects_wrong_book_invalid_utf8_and_bad_chapter(self):
  with self.assertRaises(ValueError):p.parse_usfm_units(usfm('\\v 1 texto\n'),'EXO')
  with self.assertRaises(UnicodeDecodeError):p.parse_usfm_units(b'\\id GEN\n\\c 1\n\\v 1 \xff','GEN')
  with self.assertRaises(ValueError):p.parse_usfm_units(b'\\id GEN\n\\c 0\n\\v 1 texto','GEN')
 def test_deterministic_ids_and_hashes(self):
  a,_=p.parse_usfm_units(usfm('\\v 1 Palabra.\n'),'GEN',book_id='LIB-GEN')
  b,_=p.parse_usfm_units(usfm('\\v 1 Palabra.\n'),'GEN',book_id='LIB-GEN')
  self.assertEqual(a,b);self.assertEqual(a[0]['id'],p.unit_id('TXT-RV1909','LIB-GEN','1','1','GEN.1.1'))
class TestSBLProjection(unittest.TestCase):
 def test_projects_words_prefix_suffix_and_exact_reference(self):
  source=xml('<verse-number id="John 1:1">1:1</verse-number><w>Ἐν</w><suffix></suffix><w>ἀρχῇ</w><suffix>, </suffix><prefix>«</prefix><w>λόγος</w><suffix>».</suffix>')
  units,metrics=p.parse_sbl_xml(source,'Jn','John',book_id='LIB-JHN')
  self.assertEqual(units[0]['sourceLocator'],'John 1:1');self.assertEqual(units[0]['text'],'Ἐν ἀρχῇ, «λόγος».')
  self.assertEqual(metrics['wordElements'],3);self.assertEqual(metrics['prefixElements'],1);self.assertEqual(metrics['suffixElements'],3)
 def test_preserves_ranges_and_empty_markers(self):
  source=xml('<verse-number id="John 1:1-2">1:1-2</verse-number><w>λόγος</w><suffix>.</suffix><verse-number id="John 1:3">3</verse-number>')
  units,metrics=p.parse_sbl_xml(source,'Jn','John')
  self.assertEqual([x['verse'] for x in units],['1-2','3']);self.assertEqual(metrics['rangeMarkers'],1);self.assertEqual(metrics['emptyUnitCount'],1)
 def test_rejects_unsafe_xml_wrong_book_duplicate_and_unknown_tags(self):
  for source in [b'<!DOCTYPE book [<!ENTITY x "y">]><book id="Jn">&x;</book>',xml('<verse-number id="Matthew 1:1">1</verse-number><w>λόγος</w>'),xml('<verse-number id="John 1:1">1</verse-number><w>λόγος</w><verse-number id="John 1:1">1</verse-number>'),xml('<verse-number id="John 1:1">1</verse-number><unknown>texto</unknown>')]:
   with self.assertRaises(ValueError):p.parse_sbl_xml(source,'Jn','John')
 def test_rejects_non_greek_words_and_invalid_utf8(self):
  with self.assertRaises(ValueError):p.parse_sbl_xml(xml('<verse-number id="John 1:1">1</verse-number><w>word</w>'),'Jn','John')
  with self.assertRaises(UnicodeDecodeError):p.parse_sbl_xml(b'<book id="Jn"><w>\xff</w></book>','Jn','John')
if __name__=='__main__':unittest.main()
