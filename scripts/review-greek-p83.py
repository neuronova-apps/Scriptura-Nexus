"""P8.3.2: review proposed Greek components; never admit or persist data."""
import hashlib
import importlib.util
import json
import unicodedata as ud
from collections import Counter
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("audit_p83", ROOT / "scripts/audit-greek-p83.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
DECISIONS = ROOT / "docs/P8/propuesta-admision-griega.json"
REGISTRY = ROOT / "src/data/linguistica/registro.json"
EXPECTED = {
    "GRK-C01": ("propuesto", ["texto_griego"], "CC BY 4.0"),
    "GRK-C02": ("propuesto", ["anotaciones_lema", "anotaciones_morfologia"], "CC BY-SA 3.0"),
    "GRK-C03": ("aplazado", [], "CC BY 4.0 para capas propias; fuentes mixtas")
}
def require(condition, message):
    if not condition:
        raise ValueError(message)
def validate_proposal(p):
    require(p["schemaVersion"] == 1 and p["mode"] == "review-only" and p["book"] == "3John", "Propuesta fuera de alcance")
    require(p["status"] == "pendiente_aprobacion_explicita" and p["authorization"] == {"approvedBy": None, "evidence": None} and p["publication"] is False, "No hay autorización de admisión en esta fase")
    require([f["id"] for f in p["sources"]] == list(EXPECTED), "Fuentes inesperadas")
    for f in p["sources"]:
        require((f["decision"], f["components"], f["license"]) == EXPECTED[f["id"]], "Componente o licencia fuera de propuesta")
        for key in ("fileSha256", "licenseSha256"):
            require(len(f[key]) == 64 and all(c in "0123456789abcdef" for c in f[key]), "Huella SHA-256 inválida")
        if f["decision"] == "propuesto":
            require(bool(f["attribution"].strip()), "Atribución ausente")
    return p
def verify_sha(data, expected):
    require(hashlib.sha256(data).hexdigest() == expected, "Huella SHA-256 divergente")
def marks_removed(s):
    return "".join(c for c in ud.normalize("NFD", s.casefold()) if not ud.category(c).startswith("M"))
def divergence(a, b):
    if a == b: return "exact"
    if ud.normalize("NFC", a) == ud.normalize("NFC", b): return "canonical_unicode"
    if ud.normalize("NFC", a.casefold()) == ud.normalize("NFC", b.casefold()): return "case_only"
    if marks_removed(a) == marks_removed(b): return "marks_or_case"
    return "other"
def classify(reference, candidate):
    common = sorted(set(reference) & set(candidate))
    counts = Counter(divergence(reference[k], candidate[k]) for k in common)
    return {"common": len(common), "onlyReference": len(set(reference)-set(candidate)), "onlyCandidate": len(set(candidate)-set(reference)), "classes": {k: counts[k] for k in ("exact","canonical_unicode","case_only","marks_or_case","other")}}
def morph_annotations(data):
    # Audit parser validates the source schema and original form first.
    words, _ = audit.morphgnt(data)
    pos, rows = Counter(), {}
    for line in data.decode("utf-8", errors="strict").splitlines():
        if not line.strip(): continue
        fields = line.split()
        v = int(fields[0][-2:]); pos[v] += 1
        key = (v, pos[v])
        rows[key] = {"pos": fields[1], "parsing": fields[2], "lemma": fields[6]}
    require(set(rows) == set(words), "Anotaciones huérfanas")
    return words, rows
def preview(reference, candidate, annotations):
    require(set(candidate) == set(annotations), "Anotaciones sin ocurrencia")
    # A simulated allowlist projection: do not write or return any original forms.
    matched = [k for k in sorted(reference) if k in candidate and reference[k] == candidate[k]]
    for k in matched:
        require(set(annotations[k]) == {"pos","parsing","lemma"}, "Atributo no permitido")
        require(all(isinstance(v,str) and v for v in annotations[k].values()), "Anotación vacía")
    return {"officialWords": len(reference), "eligibleExact": len(matched), "withheld": len(reference)-len(matched), "candidateOnly": len(set(candidate)-set(reference)), "admitted": 0, "persisted": 0, "published": 0}
def check_registry(reg):
    keys = {"editions","units","tokens","lemmas","identifiers","analyses","morphCodes"}
    require(set(reg) == keys | {"schemaVersion"} and reg["schemaVersion"] == 1 and all(reg[k] == [] for k in keys), "Registro público modificado")
def review(manifest, proposal, registry, fetch=audit.download):
    audit.validate_manifest(manifest)
    validate_proposal(proposal)
    check_registry(registry)
    data = []
    for f, decision in zip(manifest["files"], proposal["sources"]):
        require(f["id"] == decision["id"], "Identidad divergente")
        body, license = fetch(f, f), fetch(f, f["licenseEvidence"])
        audit.verify_bytes(body, f); audit.verify_bytes(license, f["licenseEvidence"])
        verify_sha(body, decision["fileSha256"]); verify_sha(license, decision["licenseSha256"])
        data.append(body)
    official, _ = audit.official(data[0])
    morph, annotations = morph_annotations(data[1])
    macula, _ = audit.macula(data[2])
    m, c = classify(official, morph), classify(official, macula)
    summary = preview(official, morph, annotations)
    require(len(official) == 219 and len(morph) == 219 and len(macula) == 219 and len({k[0] for k in official}) == 15, "Regresión de cobertura")
    require(m["common"] == 219 and c["common"] == 219 and m["classes"]["exact"] == 216 and c["classes"]["exact"] == 179, "Regresión de comparación")
    require(summary["eligibleExact"] == 216 and summary["withheld"] == 3, "Regresión de proyección")
    return {"mode":"review-only","book":"3John","morphgnt":m,"macula":c,"preview":summary,"approvalRequired":True,"publicRegistryEmpty":True}
def main():
    manifest = json.loads(audit.MANIFEST.read_text(encoding="utf-8"))
    proposal = json.loads(DECISIONS.read_text(encoding="utf-8"))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    a, b = review(manifest, proposal, registry), review(manifest, proposal, registry)
    require(a == b, "Revisión no reproducible")
    print(json.dumps(a, ensure_ascii=False, sort_keys=True, indent=2))
if __name__ == "__main__":
    main()
