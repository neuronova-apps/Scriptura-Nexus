import copy,importlib.util,json,pathlib,unittest,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('model',ROOT/'scripts/project-lexical-model-p84.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def xml(s):return ET.fromstring(s)
N=' xmlns="http://openscriptures.github.com/morphhb/namespace"'
class Tests(unittest.TestCase):
    def setUp(self):
        self.ds=m.admission.verified_decisions(json.loads(m.admission.MANIFEST.read_text()),json.loads(m.admission.audit.MANIFEST.read_text()))
        self.roots={
          'LEX-C03':xml('<index'+N+'><w aug="1 a">i</w></index>'),
          'LEX-C04':xml('<index'+N+'><part xml:lang="heb"><entry id="i"><w>א</w><xref strong="1" bdb="b" aug="a" twot="excluded"/><def>excluded</def></entry></part></index>'),
          'LEX-C05':xml('<lexicon'+N+'><entry id="H1"><meaning><def>definition</def><def>mixed<w>excluded</w></def></meaning><usage>excluded</usage></entry></lexicon>'),
          'LEX-C06':xml('<lexicon'+N+'><part xml:lang="heb"><section><entry id="b"><sense><sense><def>nested</def></sense></sense></entry></section></part></lexicon>')}
    def test_model(self):
        x=m.project(self.roots,self.ds,True);m.validate_model(x,self.ds,True)
        self.assertEqual(len(x['entries']),3);self.assertEqual(len(x['forms']),1);self.assertEqual(len(x['definitions']),2);self.assertNotIn('excluded',json.dumps(x))
    def test_exact_aug_and_bdb(self):
        x=m.project(self.roots,self.ds,True)
        self.assertEqual([(l['rawCode'],l['state']) for l in x['links'] if l['kind']=='aug-index'],[('1 a','documentado')])
        self.assertEqual([l['state'] for l in x['links'] if l['kind']=='index-bdb'],['documentado'])
    def test_strong_rule(self):
        self.assertEqual(m.strong_target('1',{'H1':1},True),'H1')
        for raw in ['1 a','1+',' 1','01','H1']:
            self.assertIsNone(m.strong_target(raw,{'H1':1},True))
        self.assertIsNone(m.strong_target('1',{'H1':1},False))
    def test_rule_required(self):
        x=m.project(self.roots,self.ds,False);m.validate_model(x,self.ds,False)
        self.assertEqual([l['state'] for l in x['links'] if l['kind']=='index-strong'],['sin_resolver'])
    def test_nested_locator(self):
        x=m.project(self.roots,self.ds,True)
        self.assertIn('/sense[1]/sense[1]/def[1]/text()',x['definitions'][1]['origin']['locator'])
    def test_forged_origin(self):
        x=m.project(self.roots,self.ds,True);x['forms'][0]['origin']['selector']='index/part/entry/def'
        with self.assertRaises(ValueError):m.validate_model(x,self.ds,True)
    def test_forged_target(self):
        x=m.project(self.roots,self.ds,True);next(l for l in x['links'] if l['kind']=='index-strong')['targetKey']='H2'
        with self.assertRaises(ValueError):m.validate_model(x,self.ds,True)
    def test_deterministic(self):
        self.assertEqual(m.digest(m.project(self.roots,self.ds,True)),m.digest(m.project(self.roots,self.ds,True)))
    def test_source_language_absence(self):
        x=m.project(self.roots,self.ds,True);self.assertIsNone(next(e for e in x['entries'] if e['system']=='strong')['language'])
    def test_deferred_not_available(self):
        x=m.project(self.roots,self.ds,True);self.assertEqual({e['origin']['fileId'] for e in x['entries']},{'LING-016','LING-017','LING-018'})
if __name__=='__main__':unittest.main()
