import importlib.util
import pathlib
import unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('proposal11442',ROOT/'scripts/review-lexical-p11442.py')
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
class ProposalTests(unittest.TestCase):
    def test_pending(self):
        d,_=a.validate(a.load());self.assertEqual(d['allowedComponents'],[]);self.assertFalse(d['publication'])
    def test_scope_rejects_new_rights(self):
        for key,value in [('allowedComponents',['sentidos_lexicos']),('publication',True),('proposedSelectors',['TEI/entry/*'])]:
            r=a.load();r['proposal']['candidate'][key]=value
            with self.assertRaises(ValueError):a.validate(r)
    def test_exact_identifier_and_two_roles(self):
        b=('<TEI xmlns="http://www.crosswire.org/2008/TEIOSIS/namespace"><entry n="λόγος | 1234"><orth>λόγος</orth><def role="brief">test</def><def role="full">test detail</def></entry><entry n="λέγω | 1234"><orth>λέγω</orth><def role="brief">test</def><def role="full">test detail</def></entry></TEI>').encode()
        s,_=a.inspect(b);self.assertEqual(s['entries'],2);self.assertEqual(s['definitions'],4);self.assertEqual(s['duplicateSuffixRows'],1);self.assertNotIn('λόγος',str(s))
        for bad in [b.replace(b'role="full"',b'role="brief"'),b.replace(b'test detail',b'<note>test</note>')]:
            with self.assertRaises(ValueError):a.inspect(bad)
if __name__=='__main__':unittest.main()
