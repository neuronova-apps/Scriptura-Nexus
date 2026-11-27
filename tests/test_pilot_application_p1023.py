import copy
import importlib.util
import json
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("p1023",ROOT/"scripts/audit-pilot-application-p1023.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class TestPilotApplication(unittest.TestCase):
    def setUp(self):
        self.previous=m.PREVIOUS.read_bytes()
        self.record=json.loads(m.RECORD.read_text(encoding="utf-8"))

    def test_inventory(self):
        self.assertEqual(m.validate(self.previous,self.record),{"pilots":5,"cases":17,"sections":100,"openNeeds":20,"greekIndependentChecks":11,"publicationAuthorized":False})

    def reject(self,mutate):
        r=copy.deepcopy(self.record)
        mutate(r)
        with self.assertRaises(ValueError):
            m.validate(self.previous,r)

    def test_dependency_and_publication(self):
        self.reject(lambda r:r["dependency"].update(mergeRequired=False))
        self.reject(lambda r:r.update(publicationAuthorized=True))
        self.reject(lambda r:r.update(corpusImportAuthorized=True))

    def test_source_reference_integrity(self):
        self.reject(lambda r:r["pilots"][0]["cases"][0].update(focus="27"))
        self.reject(lambda r:r["pilots"][0]["cases"][0].update(sourceUrl="https://example.org"))

    def test_no_fake_results(self):
        self.reject(lambda r:r["pilots"][0]["cases"][0].update(technicalAudit="success"))
        self.reject(lambda r:r["pilots"][0]["conclusions"].append("conclusion"))
        self.reject(lambda r:r["pilots"][0]["sections"][18].update(status="completa"))

    def test_open_needs_and_section_count(self):
        self.reject(lambda r:r["pilots"][0]["openNeeds"].pop())
        self.reject(lambda r:r["pilots"][0]["sections"].pop())

    def test_reference_missing_or_empty(self):
        case=self.record["pilots"][0]["cases"][0]
        class FakeNav:
            def locate(self,*args):
                return {"status":"empty_marker","publicationEnabled":False}
        with self.assertRaises(ValueError):
            m.check_reference(FakeNav(),m.RV,case,"28")

if __name__=="__main__":
    unittest.main()
