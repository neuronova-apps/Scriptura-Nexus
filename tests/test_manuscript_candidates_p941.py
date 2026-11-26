import copy
import importlib.util
import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "audit", ROOT / "scripts/audit-manuscript-candidates-p941.py"
)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class TestManuscriptCandidates(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(audit.MANIFEST.read_text(encoding="utf-8"))

    def test_manifest(self):
        result = audit.validate(self.data)
        self.assertEqual(result["candidates"], 11)
        self.assertEqual(result["admittedWitnesses"], 0)
        self.assertFalse(result["publicationAuthorized"])

    def test_publication_gate(self):
        data = copy.deepcopy(self.data)
        data["publicationAuthorized"] = True
        with self.assertRaises(ValueError):
            audit.validate(data)

    def test_import_gate(self):
        data = copy.deepcopy(self.data)
        data["corpusImportAuthorized"] = True
        with self.assertRaises(ValueError):
            audit.validate(data)

    def test_duplicate_candidate(self):
        data = copy.deepcopy(self.data)
        data["candidates"].append(copy.deepcopy(data["candidates"][0]))
        with self.assertRaises(ValueError):
            audit.validate(data)

    def test_missing_rights_url(self):
        data = copy.deepcopy(self.data)
        data["candidates"][0]["rightsUrl"] = None
        with self.assertRaises(ValueError):
            audit.validate(data)

    def test_unapproved_image_reuse(self):
        data = copy.deepcopy(self.data)
        data["candidates"][1]["reuse"]["images"] = True
        with self.assertRaises(ValueError):
            audit.validate(data)

    def test_unselected_edition_cannot_have_fake_source(self):
        data = copy.deepcopy(self.data)
        data["candidates"][5]["sourceUrl"] = "https://example.invalid"
        with self.assertRaises(ValueError):
            audit.validate(data)

    def test_wrong_edition_type(self):
        data = copy.deepcopy(self.data)
        data["separationRules"]["rv1909"] = "manuscrito"
        with self.assertRaises(ValueError):
            audit.validate(data)

    def test_missing_candidate(self):
        data = copy.deepcopy(self.data)
        data["candidates"].pop()
        with self.assertRaises(ValueError):
            audit.validate(data)


if __name__ == "__main__":
    unittest.main()
