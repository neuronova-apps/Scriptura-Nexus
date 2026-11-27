"""One pinned in-memory reprojection, exhaustive navigation and comparison; aggregate output only."""
import importlib.util
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("comparison_p932", ROOT / "scripts/comparison-engine-p932.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

def main():
    try:
        engine = module.build_engine()
        nav = engine.nav.audit()
        comparison = module.audit_unaligned(engine)
        module.need(nav["references"] == nav["roundTrips"] == comparison["queries"] == 39041, "reference reconciliation")
        module.need(nav["bookFragments"] == 93 and nav["chaptersByEdition"] == 1449 and nav["emptyMarkers"] == 18, "coverage reconciliation")
        module.need(nav["publicationEnabled"] is False and comparison["publicationAuthorized"] is False, "publication gate")
        module.need(nav["textPersisted"] is False and comparison["textPersisted"] is False, "persistence gate")
        module.need(nav["alignmentsCreated"] == comparison["verifiedAlignments"] == comparison["automaticAlignments"] == 0, "alignment gate")
        print(json.dumps({"phase": "P9.5", "navigation": nav, "comparison": comparison}, sort_keys=True))
        return 0
    except Exception as exc:
        print("P9.5 real audit failed (" + type(exc).__name__ + "); no corpus persisted", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
