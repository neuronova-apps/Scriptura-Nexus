import gzip, importlib.util, json, pathlib, unittest
from unittest.mock import patch
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
    def test_git_blob_normalizes_windows_line_endings(self):
        canonical=b'{"first":"line"}\n{"second":"line"}\n'
        windows=canonical.replace(b'\n',b'\r\n')
        self.assertEqual(m.git_blob(canonical),m.git_blob(windows))
    def test_git_blob_matches_pinned_provenance_on_any_platform(self):
        rights=(ROOT/'docs/P11/registro-permisos-lector-p11421.json').read_bytes()
        projection=(ROOT/'docs/P9/proyeccion-ediciones-p913.json').read_bytes()
        self.assertEqual(m.git_blob(rights),'3c6d1d783a2b95fce49c5f3d5cd5c112c0e5c67b')
        self.assertEqual(m.git_blob(projection),'ff6ef60588416089b26afcc6160df74956b496df')
    def test_admission_hash_independent_of_checkout_line_endings(self):
        original=m.p.read_admission_bytes()
        self.assertEqual(m.p.sha(original),'b42c991837c159a48de8b11a3c15ed0dee9d48b6ba5b82e502ec0569810871ea')
        with patch.object(pathlib.Path,'read_bytes',return_value=original.replace(b'\n',b'\r\n')):
            self.assertEqual(m.p.read_admission_bytes(),original)
    def test_historical_gzip_header_and_roundtrip(self):
        raw=b'synthetic fixture'
        self.assertEqual(m.historical_gzip(raw)[9],3)
        self.assertEqual(gzip.decompress(m.historical_gzip(raw)),raw)
        packed=gzip.compress(raw,compresslevel=6,mtime=0)
        with patch.object(m.gzip,'compress',return_value=packed[:9]+b'\x0a'+packed[10:]):
            self.assertEqual(m.historical_gzip(raw),packed[:9]+b'\x03'+packed[10:])
    def test_alternative_requires_pinned_archive_and_complete_inventory(self):
        meta=json.loads(m.p.read_admission_bytes())['decisions'][0]['sourceArchive']
        data=b'fixture'
        inventory={'files':meta['files'],'ancillary':meta['ancillaryFiles'],'books':66,'chapters':1189,'verseMarkers':31102}
        with patch.object(m.p,'RV_ALTERNATIVE_BYTES',len(data)),patch.object(m.p,'RV_ALTERNATIVE_SHA256',m.p.sha(data)),patch.object(m.p.P91,'fetch',return_value=data) as fetch,patch.object(m.p.P91,'audit_zip',return_value=inventory) as audit:
            self.assertEqual(m.p.fetch_rv_archive(meta,use_alternative=True),data)
            fetch.assert_called_once_with(m.p.RV_ALTERNATIVE_URL,16*1024*1024)
            audit.return_value={**inventory,'files':inventory['files'][:-1]}
            with self.assertRaisesRegex(ValueError,'RV source inventory'):m.p.fetch_rv_archive(meta,use_alternative=True)
            audit.return_value=inventory
            with self.assertRaisesRegex(ValueError,'RV archive fingerprint'):m.p.fetch_rv_archive(meta)
            fetch.return_value=b'bad'
            with self.assertRaisesRegex(ValueError,'RV archive fingerprint'):m.p.fetch_rv_archive(meta,use_alternative=True)
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
