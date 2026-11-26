import copy,importlib.util,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('closure',ROOT/'scripts/validate-linguistic-closure-p85.py')
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class TestClosure(unittest.TestCase):
 def setUp(self):
    self.c=m.load(m.MANIFEST);self.r=m.load('docs/P8/revision-publicacion-p85.json')
 def test_checkpoint(self):m.validate(self.c,self.r)
 def test_no_publication(self):
    self.c['publication']=True
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
 def test_no_formal_acceptance(self):
    self.c['formalAcceptance']='not documented'
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
 def test_partial_coverage(self):
    self.c['fullCanon']=True
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
 def test_expansion(self):
    self.c['coverageException']['admitted']=True
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
 def test_pending(self):
    self.c['pending']['morphologyPartial']=0
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
 def test_evidence(self):
    self.c['evidence'][0]['conclusion']='failure'
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
 def test_budget(self):
    self.c['performance']['budgets']['jsBytes']=999999
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
 def test_manual(self):
    self.c['accessibility']['manual']='aprobada'
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
 def test_digest(self):
    self.c['metrics']['indexDigest']='0'*64
    with self.assertRaises(ValueError):m.validate(self.c,self.r)
if __name__=='__main__':unittest.main()
