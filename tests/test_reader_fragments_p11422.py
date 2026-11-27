import importlib.util, pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('p11422',ROOT/'scripts/project-reader-fragments-p11422.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def unit(ch,v,order,text='Prueba sintética'):
    return m.p.make_unit('TXT-TEST','LIB-TEST',ch,v,order,text,'REC-TEST','TEST.'+ch+'.'+v,'a'*64)
def meta(units):
    return {'unitCount':len(units),'projectionSha256':m.p.digest_units(units),'resourceId':'REC-TEST',
        'chapters':len({u['chapter'] for u in units}),'emptyUnitCount':sum(not u['text'] for u in units),
        'emptyUnitLocators':[u['sourceLocator'] for u in units if not u['text']]}
class FragmentTests(unittest.TestCase):
    def test_plan(self):
        self.assertEqual(len(m.check_plan()['editions']),2)
    def test_unicode_ranges_empty_and_deterministic(self):
        rows=[unit('1','1-2',0,'λόγος'),unit('1','3a',1,''),unit('1','4',2,'á')]
        d,r,g=m.make_fragment('TXT-TEST','LIB-TEST','1',rows)
        self.assertEqual(d['verses'],['1-2','3a','4'])
        self.assertEqual(d['emptyMarkers'],1)
        self.assertEqual(m.verify_fragment(d,r,g),rows)
        self.assertEqual(m.make_fragment('TXT-TEST','LIB-TEST','1',rows),(d,r,g))
    def test_hash_and_descriptor_tamper(self):
        d,r,g=m.make_fragment('TXT-TEST','LIB-TEST','1',[unit('1','1',0)])
        with self.assertRaises(ValueError):m.verify_fragment(d,r+b' ',g)
        with self.assertRaises(ValueError):m.verify_fragment(d,r,g+b'\0')
        with self.assertRaises(ValueError):m.verify_fragment({**d,'emptyMarkers':99},r,g)
    def test_native_order_and_two_chapters(self):
        rows=[unit('1','1',0),unit('1','3',1),unit('2','1',2,'')]
        idx=m.project_book('TXT-TEST','LIB-TEST',rows,meta(rows))
        self.assertEqual([x['chapter'] for x in idx],['1','2'])
        self.assertEqual([x['firstOrder'] for x in idx],[0,2])
        self.assertEqual(idx[0]['verses'],['1','3'])
    def test_invalid_identity_or_order(self):
        with self.assertRaises(ValueError):m.make_fragment('TXT-TEST','LIB-OTHER','1',[unit('1','1',0)])
        with self.assertRaises(ValueError):m.make_fragment('TXT-TEST','LIB-TEST','1',[unit('1','1',0),unit('1','1',1)])
        with self.assertRaises(ValueError):m.make_fragment('TXT-TEST','LIB-TEST','1',[unit('1','1',0),unit('1','2',2)])
    def test_source_mismatch_and_noncontiguous(self):
        rows=[unit('1','1',0),unit('2','1',1),unit('1','2',2)]
        with self.assertRaises(ValueError):m.project_book('TXT-TEST','LIB-TEST',rows,meta(rows))
        rows=[unit('1','1',0)]
        with self.assertRaises(ValueError):m.project_book('TXT-TEST','LIB-TEST',rows,{**meta(rows),'projectionSha256':'0'*64})
    def test_budget_guard(self):
        old=m.MAX_GZIP
        try:
            m.MAX_GZIP=1
            with self.assertRaises(ValueError):m.make_fragment('TXT-TEST','LIB-TEST','1',[unit('1','1',0)])
        finally:m.MAX_GZIP=old
if __name__=='__main__':unittest.main()
