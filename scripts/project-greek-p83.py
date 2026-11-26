"""Private pipe to the Node validation runner; no file persistence."""
import importlib.util
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("review_p83", ROOT / "scripts/review-greek-p83.py")
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)
audit = review.audit
MANIFEST = ROOT / "docs/P8/admision-griega.json"

def verified_admission(m, candidates, proposal):
    review.validate_proposal(proposal)
    audit.validate_manifest(candidates)
    review.require(m["schemaVersion"] == 1 and m["scope"] == "3John-validation-only" and m["publication"] is False and m["deferred"] == ["GRK-C03"], "Alcance inválido")
    review.require(m["authorization"]["date"] == "2026-11-26" and bool(m["authorization"]["basis"].strip()), "Autorización ausente")
    review.require([f["id"] for f in m["files"]] == ["LING-013","LING-014"], "IDs fuera de alcance")
    for f, c, p in zip(m["files"], candidates["files"][:2], proposal["sources"][:2]):
        review.require(f["candidateId"] == c["id"] == p["id"] and f["review"] == "aprobado", "Decisión inválida")
        for k in ("repository","commit","path","bytes"):
            review.require(f[k] == c[k], "Procedencia divergente")
        review.require(f["sha256"] == p["fileSha256"] and f["licenseEvidence"] == {**c["licenseEvidence"],"sha256":p["licenseSha256"]}, "Huella divergente")
        review.require(f["allowedComponents"] == p["components"] and f["license"] == p["license"] and f["attribution"] == p["attribution"], "Componente o atribución divergente")
        review.require(bool(f["conditions"]) and f["approvalRef"] == "docs/P8/12-admision-griega.md", "Condiciones ausentes")
    return m["files"]

def project(m, candidates, proposal, fetch=audit.download):
    files = verified_admission(m, candidates, proposal)
    data = []
    for f,c in zip(files,candidates["files"][:2]):
        body, license = fetch(c,c),fetch(c,c["licenseEvidence"])
        audit.verify_bytes(body,c); audit.verify_bytes(license,c["licenseEvidence"])
        review.verify_sha(body,f["sha256"]); review.verify_sha(license,f["licenseEvidence"]["sha256"])
        data.append(body)
    official,_ = audit.official(data[0])
    morph,ann = review.morph_annotations(data[1])
    review.require(set(official) == set(morph), "Posiciones divergentes")
    out = []
    for (verse,position), form in sorted(official.items()):
        a = ann[(verse,position)] if morph[(verse,position)] == form else None
        out.append({"verse":verse,"position":position,"form":form,"annotation":a})
    review.require(len(out) == 219 and len({x["verse"] for x in out}) == 15 and sum(x["annotation"] is not None for x in out) == 216, "Línea base divergente")
    return {"rows":out}

if __name__ == "__main__":
    # stdout is captured in memory by import-greek-p83.mjs; never printed by CI.
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    c = json.loads(audit.MANIFEST.read_text(encoding="utf-8"))
    p = json.loads(review.DECISIONS.read_text(encoding="utf-8"))
    print(json.dumps(project(m,c,p),ensure_ascii=False,separators=(",",":")))
