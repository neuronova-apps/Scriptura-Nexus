"""P10.2.3: traceable pilot anchor checks in memory. Never output corpus text."""
import hashlib
import importlib.util
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
PREVIOUS = ROOT / "docs/P10/registro-fuentes-p1022.json"
RECORD = ROOT / "docs/P10/registro-aplicacion-p1023.json"
RV = "TXT-RV1909"
GREEK = "TXT-SBLGNT-V1-2"
PILOTS = ["SN-001", "SN-015", "SN-008", "SN-021", "SN-040"]
# Source-native anchors and bounded windows; not asserted pericope boundaries.
EXPECTED = [
 [("LEV",19,28,26,29),("DEU",14,1,1,2)],
 [("GEN",14,20,17,24),("LEV",27,30,30,34),("MAL",3,8,7,12),("MAT",23,23,23,24),("2CO",9,7,5,9)],
 [("ACT",2,4,1,13),("ACT",10,46,44,48),("ACT",19,6,1,7),("1CO",12,10,4,11),("1CO",13,8,8,13),("1CO",14,2,1,5)],
 [("PSA",22,1,1,5),("MAT",27,46,43,50),("MRK",15,34,33,39)],
 [("JHN",1,18,14,18)]
]
GREEK_BOOKS = {"MAT","MRK","JHN","ACT","1CO","2CO"}

def need(ok, reason):
    if not ok:
        raise ValueError(reason)

def git_blob(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()

def validate(previous_bytes, r):
    p = json.loads(previous_bytes)
    need(git_blob(previous_bytes) == "bd180877a71a2c59adee9d92fd4111e9d9985e79", "previous fingerprint")
    need(set(r) == {"schemaVersion","phase","dependency","consultedOn","publicationAuthorized","corpusImportAuthorized","scope","pilots"}, "record keys")
    need(r["schemaVersion"] == 1 and r["phase"] == "P10.2.3" and r["consultedOn"] == "2026-11-26", "identity")
    need(r["dependency"] == {"pr":73,"headSha":"811ea676a4fb31380a18d6648ed37e04939b9452","sourceBlob":git_blob(previous_bytes),"mergeRequired":True,"previousDeploymentConfirmationRequired":True}, "dependency")
    need(r["publicationAuthorized"] is False and r["corpusImportAuthorized"] is False and r["scope"] == "prueba_metodologica_acotada_sin_borradores_publicos", "permissions")
    need([x["id"] for x in r["pilots"]] == PILOTS == [x["id"] for x in p["pilots"]], "pilot IDs")
    for i, (x, old) in enumerate(zip(r["pilots"],p["pilots"])):
        need(set(x) == {"id","cases","sections","openNeeds","limits","evidenceIds","conclusions"}, "pilot keys")
        need(x["evidenceIds"] == [] and x["conclusions"] == [], "no editorial evidence or conclusions")
        need(isinstance(x["limits"],str) and x["limits"].strip(), "limits")
        need(x["openNeeds"] == [n["need"] for n in old["needs"]], "preserve documentary gaps")
        urls = [url for ref in old["references"] for url in ref["chapterUrls"]]
        need([c["sourceUrl"] for c in x["cases"]] == urls, "chapter coverage")
        need(len(x["cases"]) == len(EXPECTED[i]), "case count")
        for c,(b,ch,v,start,end) in zip(x["cases"],EXPECTED[i]):
            need(set(c) == {"bookId","chapter","focus","contextStart","contextEnd","sourceId","sourceUrl","status","question","technicalAudit","greekIndependentCheck"}, "case keys")
            need([c[k] for k in ("bookId","chapter","focus","contextStart","contextEnd")] == ["LIB-"+b,*map(str,(ch,v,start,end))], "native reference")
            need(c["sourceId"] == "P1022-R01" and c["status"] == "referencia_y_contexto_web_consultados" and c["technicalAudit"] == "pendiente_CI", "verification scope")
            need(c["greekIndependentCheck"] is (b in GREEK_BOOKS), "independent Greek check")
            need(isinstance(c["question"],str) and c["question"].strip(), "neutral question")
        sections = []
        for j in range(20):
            status = ("preparada_desde_delimitacion" if j in (0,1) else "parcial_requiere_revision" if j in (3,5,19) else "parcial_referencia_documental_previa" if j==7 and i==4 else "pendiente")
            sections.append({"id":x["id"]+"/S"+str(j+1).zfill(2),"status":status})
        need(x["sections"] == sections, "section states")
    return {"pilots":5,"cases":17,"sections":100,"openNeeds":20,"greekIndependentChecks":11,"publicationAuthorized":False}

def check_reference(nav, edition, c, verse):
    result = nav.locate(edition,c["bookId"],c["chapter"],str(verse))
    need(result["status"] == "verified_fragment" and result.get("publicationEnabled") is False,"reference unavailable or empty")
    ref = result["reference"]
    need(ref["editionId"] == edition and ref["bookId"] == c["bookId"] and ref["chapter"] == c["chapter"] and ref["verse"] == str(verse),"reference drift")

def audit(engine,r):
    rv_count = greek_count = 0
    for p in r["pilots"]:
        for c in p["cases"]:
            for v in range(int(c["contextStart"]),int(c["contextEnd"])+1):
                check_reference(engine.nav,RV,c,v)
                rv_count += 1
            if c["greekIndependentCheck"]:
                check_reference(engine.nav,GREEK,c,c["focus"])
                greek_count += 1
                ref = {"bookId":c["bookId"],"chapter":c["chapter"],"verse":c["focus"]}
                comparison = engine.compare(RV,ref,GREEK,ref)
                need(comparison["status"] == "not_aligned" and comparison["alignment"] is None and comparison["comparison"] is None and comparison["publicationAuthorized"] is False,"unverified alignment")
    need(greek_count == 11 and rv_count == sum(int(c["contextEnd"])-int(c["contextStart"])+1 for p in r["pilots"] for c in p["cases"]),"audit counts")
    return {"rvContextUnits":rv_count,"greekIndependentAnchors":greek_count,"verifiedAlignmentsCreated":0,"textPersisted":False,"publicationAuthorized":False}

def main():
    try:
        r = json.loads(RECORD.read_text(encoding="utf-8"))
        counts = validate(PREVIOUS.read_bytes(),r)
        spec = importlib.util.spec_from_file_location("comparison_p932",ROOT/"scripts/comparison-engine-p932.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        counts.update(audit(mod.build_engine(),r))
        print(json.dumps(counts,sort_keys=True))
        return 0
    except Exception as exc:
        print("P10.2.3 audit failed ("+type(exc).__name__+"); no corpus persisted",file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
