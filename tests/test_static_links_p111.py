import importlib.util
import pathlib
import unittest
from tempfile import TemporaryDirectory
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('audit_p111',ROOT/'scripts/audit-static-links-p111.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class TestAudit(unittest.TestCase):
    def test_valid_links(self):
        files={'index.html','estudios/index.html','asset.js'}
        self.assertEqual(m.target_for(m.page_url('index.html'),'estudios/#x',files),('estudios/index.html','x'))
        self.assertEqual(m.target_for(m.page_url('estudios/index.html'),'../asset.js',files),('asset.js',''))
    def test_base_and_missing(self):
        for href in ['/outside/','/Scriptura-Nexus/missing/']:
            with self.assertRaises(ValueError):m.target_for(m.page_url('index.html'),href,{'index.html'})
    def test_external(self):
        self.assertIsNone(m.target_for(m.page_url('index.html'),'https://example.org/',{'index.html'}))
    def test_html_parser(self):
        p=m.Page('<a id="x" href="#x">a</a><script src="app.js"></script>')
        self.assertEqual(p.ids,{'x'});self.assertEqual(p.links,['#x','app.js'])
    def test_audit_anchor(self):
        with TemporaryDirectory() as tmp:
            root=pathlib.Path(tmp)
            (root/'index.html').write_text('<a href="#x" id="x">ok</a>')
            (root/'404.html').write_text('<a href="/Scriptura-Nexus/">home</a>')
            self.assertEqual(m.audit(root)['localTargetsChecked'],2)
            (root/'index.html').write_text('<a href="#missing">bad</a>')
            with self.assertRaises(ValueError):m.audit(root)
if __name__=='__main__':unittest.main()
