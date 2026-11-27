import importlib.util,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('prep',ROOT/'scripts/prepare-linguistic-expansion-p11432.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Expansion(unittest.TestCase):
    def test_scope(self):
        r=json.loads(m.MANIFEST.read_bytes());m.validate(r)
        r['newAdmissionAuthorized']=True
        with self.assertRaises(ValueError):m.validate(r)
    def test_original_import_gate(self):
        with self.assertRaisesRegex(ValueError,'P8.2.2'):m.osis.parse(b'', 'Lev')
    def test_large_letter_segment_exact_form_and_offsets(self):
        xml=('<osis xmlns="'+m.osis.NS+'"><osisText osisIDWork="OSHB"><div type="book" osisID="Lev"><chapter osisID="Lev.11"><verse osisID="Lev.11.42"><w lemma="fixture" morph="HN" id="fixture">א<seg type="x-large">בּ</seg>ג</w><w lemma="fixture2" morph="HN">ד</w></verse></chapter></div></osisText></osis>').encode()
        result=m.osis._parse_primary(xml,'Lev',allow_large_segments=True)
        events=result['chapters'][0]['verses'][0]['events']
        self.assertEqual(events[0]['form'],'אבּג')
        self.assertEqual(events[0]['letterSegments'],[{'type':'x-large','start':1,'length':2}])
        self.assertEqual(events[0]['lemmaRaw'],'fixture')
        self.assertEqual(events[0]['morphRaw'],'HN')
        self.assertEqual(len(events),2)
        self.assertEqual(len(m.osis._parse_primary(xml,'Lev')['chapters'][0]['verses'][0]['events']),1)
        with self.assertRaises(ValueError):
            m.osis._parse_primary(xml.replace(b'x-large',b'x-unknown'),'Lev',allow_large_segments=True)
        summary=m.hebrew_projection(xml,'Lev',{'chapters':1,'verseElements':1,'directWords':2})
        self.assertEqual(summary['largeLetterSegments'],1)
        self.assertEqual(summary['primaryWords'],2)
    def test_separate_layers_and_no_inferred_match(self):
        data='050101 N- ----NSM- α α α α\n050101 N- ----NSM- β β β β\n050102 N- ----NSM- γ γ γ γ\n'.encode()
        text,ann=m.greek_layers({('1','1'):['α','δ'],('1','2'):['γ','δ']},data,'05')
        self.assertEqual(len(text),4);self.assertEqual(len(ann),1)
        self.assertEqual(set(ann[0]),{'chapter','verse','position','pos','parsing','lemma'})
        self.assertEqual(ann[0]['position'],1)
if __name__=='__main__':unittest.main()
