import copy
import importlib.util
import json
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("audit_greek", ROOT / "scripts/audit-greek-p83.py")
m = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)
class AuditGreekTest(unittest.TestCase):
    def test_manifest_pending(self):
        a = json.loads(m.MANIFEST.read_text())
        self.assertEqual(len(m.validate_manifest(a)["files"]), 3)
        b = copy.deepcopy(a)
        b["files"][0]["review"] = "aprobado"
        with self.assertRaises(ValueError): m.validate_manifest(b)
    def test_bytes(self):
        data = b"abc"
        meta = {"bytes": 3, "gitBlobSha1": m.git_blob(data)}
        self.assertEqual(len(m.verify_bytes(data, meta)["sha256"]), 64)
        with self.assertRaises(ValueError): m.verify_bytes(b"abd", meta)
    def test_unsafe_path(self):
        for path in ("../x", "/x", "a//x", "a/./x"):
            with self.assertRaises(ValueError): m.check_path(path)
    def test_xml_entity_rejected(self):
        with self.assertRaises(ValueError): m.xml_root(b'<!DOCTYPE x [<!ENTITY y "x">]><x/>')
    def test_official(self):
        a, metrics = m.official('<book id="3Jn"><verse-number id="3 John 1:1"/><w>α</w><w>β</w></book>'.encode())
        self.assertEqual(metrics, {"verses": 1, "words": 2})
        self.assertEqual(a[(1, 2)], "β")
    def test_morphgnt(self):
        a, metrics = m.morphgnt("250101 N- ----NSM- α α α α\n".encode())
        self.assertEqual(metrics["words"], 1)
        with self.assertRaises(ValueError): m.morphgnt(b"250101 bad")
    def test_macula(self):
        data = '<Sentences><Node ref="3JN 1:1!1" morphId="1" Unicode="α" LN="restricted"/></Sentences>'.encode()
        a, metrics = m.macula(data)
        self.assertEqual(metrics["attributeInventory"]["LN"], 1)
        self.assertNotIn("restricted", str(metrics))
        with self.assertRaises(ValueError): m.macula(data.replace(b"</Sentences>", b'<Node ref="3JN 1:1!1" morphId="2" Unicode="x"/></Sentences>'))
    def test_compare_no_equivalence(self):
        out = m.compare({(1,1):"α", (1,2):"β"}, {(1,1):"α", (1,2):"γ", (1,3):"δ"})
        self.assertEqual((out["exactForms"],out["differentForms"],out["onlyCandidate"]),(1,1,1))
if __name__ == "__main__": unittest.main()
