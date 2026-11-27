import importlib.util,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('audit',ROOT/'scripts/audit-linguistic-priority-p11431.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class PriorityAudit(unittest.TestCase):
    def test_scope(self):
        p=json.loads(m.MANIFEST.read_bytes());m.validate(p)
        p['publicationAuthorized']=True
        with self.assertRaises(ValueError):m.validate(p)
    def test_exact_positions(self):
        a={('1','1'):['α','β'],('1','2'):['γ']}
        b={('1','1'):['α','δ'],('1','2'):['γ','δ']}
        metrics,refs=m.compare(a,b)
        self.assertEqual(metrics['eligibleExact'],1)
        self.assertEqual(metrics['withheld'],2)
        self.assertEqual(refs[('1','2')]['eligibleExact'],0)
    def test_no_inferred_reference(self):
        metrics,_=m.compare({('1','1'):['α']},{('1','2'):['α']})
        self.assertEqual(metrics['eligibleExact'],0)
        self.assertEqual(metrics['candidateOnlyVerses'],1)
    def test_morph_reference(self):
        rows=m.morph('050204 N- ----NSM- α α α α\n050204 N- ----NSM- β β β β\n'.encode(),'05')
        self.assertEqual(rows,{('2','4'):['α','β']})
        with self.assertRaises(ValueError):m.morph('070204 N- ----NSM- α α α α'.encode(),'05')
    def test_pinned_bytes(self):
        src={'repository':'example/source','commit':'a'*40}
        data=b'fixture'
        meta={'path':'sample.txt','bytes':len(data),'gitBlobSha1':m.p91.blob(data),'sha256':m.p91.sha(data)}
        self.assertEqual(m.fixed(src,meta,lambda url,limit:data)[0],data)
        with self.assertRaises(ValueError):m.fixed(src,meta,lambda url,limit:b'changed')
if __name__=='__main__':unittest.main()
