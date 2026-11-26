"""P8.3.1: candidate audit only, no corpus persistence or admission."""
import argparse
import hashlib
import json
import re
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs/P8/candidatos-griegos-p83.json"
LIMIT = 1024 * 1024
EXPECTED_IDS = ["GRK-C01", "GRK-C02", "GRK-C03"]
HEX40 = re.compile(r"^[0-9a-f]{40}$")
REPO = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
GREEK = re.compile(r"[\u0370-\u03ff\u1f00-\u1fff]")
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("Redirección no admitida")

def git_blob(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()

def verify_bytes(data, meta):
    if len(data) != meta["bytes"] or git_blob(data) != meta["gitBlobSha1"]:
        raise ValueError("Tamaño o huella Git divergente")
    return {"bytes": len(data), "gitBlobSha1": git_blob(data), "sha256": hashlib.sha256(data).hexdigest()}

def check_path(path):
    if not isinstance(path, str) or not path or path.startswith("/") or any(p in ("", ".", "..") for p in path.split("/")) or "\\" in path:
        raise ValueError("Ruta inválida")

def validate_manifest(m):
    if m.get("schemaVersion") != 1 or m.get("mode") != "audit-only" or [f.get("id") for f in m["files"]] != EXPECTED_IDS:
        raise ValueError("Manifiesto fuera del alcance")
    for f in m["files"]:
        if f.get("review") != "pendiente" or f.get("book") != "3John" or not REPO.fullmatch(f["repository"]) or not HEX40.fullmatch(f["commit"]):
            raise ValueError("Candidato no autorizado para esta auditoría")
        for x in (f, f["licenseEvidence"]):
            check_path(x["path"])
            if not isinstance(x["bytes"], int) or not 0 < x["bytes"] <= LIMIT or not HEX40.fullmatch(x["gitBlobSha1"]):
                raise ValueError("Metadatos de archivo inválidos")
    return m

def download(f, meta):
    url = "https://raw.githubusercontent.com/" + f["repository"] + "/" + f["commit"] + "/" + urllib.parse.quote(meta["path"], safe="/")
    req = urllib.request.Request(url, headers={"User-Agent": "Scriptura-Nexus-P8.3.1", "Accept-Encoding": "identity"})
    with urllib.request.build_opener(NoRedirect()).open(req, timeout=60) as response:
        data = response.read(meta["bytes"] + 1)
    verify_bytes(data, meta)
    return data

def xml_root(data):
    if re.search(br"<!\s*(DOCTYPE|ENTITY)\b", data, re.I):
        raise ValueError("DTD o entidad no admitida")
    data.decode("utf-8-sig", errors="strict")
    return ET.fromstring(data)

def add_word(words, key, form):
    if key in words or not form or not GREEK.search(form):
        raise ValueError("Ocurrencia duplicada o forma no griega")
    words[key] = form

def official(data):
    root = xml_root(data)
    if root.tag != "book" or root.get("id") != "3Jn":
        raise ValueError("Libro oficial incorrecto")
    words, verse, pos = {}, None, 0
    for node in root.iter():
        if node.tag == "verse-number":
            match = re.fullmatch(r"3 John 1:(\d+)", node.get("id", ""))
            if not match:
                raise ValueError("Referencia oficial inválida")
            verse, pos = int(match[1]), 0
        elif node.tag == "w":
            if verse is None:
                raise ValueError("Palabra sin referencia")
            pos += 1
            add_word(words, (verse, pos), node.text)
    return words, {"verses": len({k[0] for k in words}), "words": len(words)}

def morphgnt(data):
    words, positions, pos_codes, parsing = {}, Counter(), Counter(), Counter()
    for row in data.decode("utf-8", errors="strict").splitlines():
        if not row.strip():
            continue
        fields = row.split()
        if len(fields) != 7 or not re.fullmatch(r"2501\d{2}", fields[0]) or not re.fullmatch(r"[A-Z][A-Z-]", fields[1]) or not re.fullmatch(r"[A-Z1-3-]{8}", fields[2]):
            raise ValueError("Fila MorphGNT fuera del esquema esperado")
        verse = int(fields[0][-2:])
        positions[verse] += 1
        add_word(words, (verse, positions[verse]), fields[4])
        pos_codes[fields[1]] += 1
        parsing[fields[2]] += 1
        if not GREEK.search(fields[6]):
            raise ValueError("Lema no griego")
    return words, {"verses": len(positions), "words": len(words), "distinctPosCodes": len(pos_codes), "distinctParsingCodes": len(parsing)}

def macula(data):
    root = xml_root(data)
    if root.tag != "Sentences":
        raise ValueError("Raíz MACULA inesperada")
    words, attrs = {}, Counter()
    for node in root.iter("Node"):
        ref = node.get("ref")
        if not ref or not node.get("morphId"):
            continue
        match = re.fullmatch(r"3JN 1:(\d+)!(\d+)", ref)
        if not match:
            raise ValueError("Referencia MACULA inesperada")
        add_word(words, (int(match[1]), int(match[2])), node.get("Unicode"))
        attrs.update(node.attrib.keys())
    # Metadata only. Do not output source forms or attribute values.
    return words, {"verses": len({k[0] for k in words}), "words": len(words), "attributeInventory": dict(sorted(attrs.items()))}

def compare(reference, candidate):
    a, b = set(reference), set(candidate)
    common = a & b
    return {"referenceWords": len(a), "candidateWords": len(b), "commonPositions": len(common), "exactForms": sum(reference[k] == candidate[k] for k in common), "differentForms": sum(reference[k] != candidate[k] for k in common), "onlyReference": len(a-b), "onlyCandidate": len(b-a)}

def audit(manifest, fetch=download):
    validate_manifest(manifest)
    parsers = [official, morphgnt, macula]
    result, sequences = [], []
    for f, parser in zip(manifest["files"], parsers):
        data, license_data = fetch(f, f), fetch(f, f["licenseEvidence"])
        fingerprint, license_fp = verify_bytes(data, f), verify_bytes(license_data, f["licenseEvidence"])
        words, metrics = parser(data)
        if not words:
            raise ValueError("No se encontraron ocurrencias")
        sequences.append(words)
        result.append({"id": f["id"], "commit": f["commit"], "file": fingerprint, "licenseEvidence": license_fp, "metrics": metrics, "review": "pendiente"})
    return {"schemaVersion": 1, "mode": "audit-only", "files": result, "comparisons": {"officialVsMorphGNT": compare(sequences[0], sequences[1]), "officialVsMACULA": compare(sequences[0], sequences[2])}, "approved": 0, "published": 0, "semanticEquivalenceEstablished": False}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    first, second = audit(manifest), audit(manifest)
    if first != second:
        raise ValueError("Auditorías no reproducibles")
    print(json.dumps(first, ensure_ascii=False, sort_keys=True, indent=2))

if __name__ == "__main__":
    main()
