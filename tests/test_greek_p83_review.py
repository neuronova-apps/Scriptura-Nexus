import copy
import importlib.util
import json
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("review_p83", ROOT / "scripts/review-greek-p83.py")
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
class ReviewGreekTest(unittest.TestCase):
    def proposal(self):
        return json.loads(m.DECISIONS.read_text())
    def test_pending_only(self):
        p = self.proposal()
        self.assertEqual(m.validate_proposal(p)["status"], "pendiente_aprobacion_explicita")
        p["authorization"]["approvedBy"] = "synthetic"
        with self.assertRaises(ValueError): m.validate_proposal(p)
    def test_component_gate(self):
        p = self.proposal()
        p["sources"][1]["components"].append("texto_griego")
        with self.assertRaises(ValueError): m.validate_proposal(p)
    def test_macula_not_admitted(self):
        p = self.proposal()
        p["sources"][2]["decision"] = "propuesto"
        with self.assertRaises(ValueError): m.validate_proposal(p)
    def test_sha_mismatch(self):
        with self.assertRaises(ValueError): m.verify_sha(b"x", "0"*64)
    def test_divergence(self):
        self.assertEqual(m.divergence("ά","α\u0301"),"canonical_unicode")
        self.assertEqual(m.divergence("Α","α"),"case_only")
        self.assertEqual(m.divergence("ά","α"),"marks_or_case")
        self.assertEqual(m.divergence("β","α"),"other")
    def test_no_normalized_link(self):
        a={(1,1):"ά",(1,2):"β"}
        b={(1,1):"α\u0301",(1,2):"β"}
        rows={k:{"pos":"N-","parsing":"--------","lemma":"synthetic"} for k in b}
        x=m.preview(a,b,rows)
        self.assertEqual((x["eligibleExact"],x["withheld"],x["published"]),(1,1,0))
    def test_no_extra_fields(self):
        with self.assertRaises(ValueError): m.preview({(1,1):"α"},{(1,1):"α"},{(1,1):{"pos":"N-","parsing":"--------","lemma":"x","strong":"x"}})
    def test_registry(self):
        r=json.loads(m.REGISTRY.read_text())
        m.check_registry(r)
        r["tokens"].append({"id":"synthetic"})
        with self.assertRaises(ValueError): m.check_registry(r)
if __name__ == "__main__": unittest.main()
