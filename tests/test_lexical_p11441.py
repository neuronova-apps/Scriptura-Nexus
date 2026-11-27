import copy
import importlib.util
import pathlib
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('audit11441',ROOT/'scripts/audit-lexical-p11441.py')
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
class AuditTests(unittest.TestCase):
    def test_historical_scope(self):
        self.assertEqual(len(a.validate(a.load())['decisions']),7)
    def test_new_candidate_remains_unadmitted(self):
        for key,value in [('publication',True),('allowedComponents',['sentidos_lexicos']),('path','dodson.csv')]:
            r=a.load();r['scope']['newCandidate'][key]=value
            with self.assertRaises(ValueError):a.validate(r)
    def test_no_implicit_publication_or_links(self):
        for key in ['publicationAuthorized','automaticCorpusLinks','semanticEquivalences','translateDefinitions','corpusPersisted']:
            r=a.load();r['decision'][key]=True
            with self.assertRaises(ValueError):a.validate(r)
    def test_metadata_only_xml(self):
        r=a.xml_inventory('<lex><entry id="secret">λόγος</entry></lex>'.encode())
        self.assertEqual(r['elements'],2);self.assertEqual(r['greekUnicodeTextNodes'],1)
        self.assertNotIn('secret',str(r));self.assertNotIn('λόγος',str(r))
    def test_reject_unsafe_xml(self):
        with self.assertRaises(ValueError):a.xml_inventory(b'<!DOCTYPE lex [<!ENTITY x "test">]><lex><entry>&x;</entry></lex>')
if __name__=='__main__':unittest.main()
