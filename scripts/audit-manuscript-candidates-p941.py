"""P9.4.1 validates a metadata-only candidate register; it never fetches or imports manuscripts."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs/P9/candidatos-manuscritos-p941.json"
EXPECTED = {
    "MS-C01", "MS-C02", "MS-C03", "MS-C04", "MS-C05",
    "ED-C01", "ED-C02", "ED-C03", "ED-C04", "ED-C05", "ED-C06",
}
REPOSITORIES = {"MS-C01", "MS-C02", "MS-C03", "MS-C04", "MS-C05"}
BLOCKED = {
    "download", "scrape", "embed_images", "republish_images",
    "republish_transcriptions", "bulk_metadata_export",
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate(data):
    require(data["schemaVersion"] == 1, "schema version")
    require(data["phase"] == "P9.4.1-source-audit", "phase")
    require(data["reviewedOn"] == "2026-11-26", "review date")
    require(data["publicationAuthorized"] is False, "publication gate")
    require(data["corpusImportAuthorized"] is False, "corpus gate")
    candidates = data["candidates"]
    ids = [candidate["id"] for candidate in candidates]
    require(len(ids) == len(set(ids)), "duplicate candidate id")
    require(set(ids) == EXPECTED, "candidate inventory")
    for candidate in candidates:
        require(candidate["reuse"] == {
            "images": False, "transcriptions": False,
            "metadata": False, "apparatus": False,
        }, "reuse gate: " + candidate["id"])
        require(candidate["blockedActions"] and set(BLOCKED).issubset(set(candidate["blockedActions"]))
                if candidate["id"] in REPOSITORIES else True, "repository reuse controls")
        if candidate["id"] in REPOSITORIES:
            require(candidate["status"] == "external_link_only", "repository status")
            require(candidate["sourceUrl"].startswith("https://"), "source URL")
            require(candidate["rightsUrl"].startswith("https://"), "rights URL")
            require(candidate["rightsStatus"] == "verified_restrictions", "rights evidence")
            require(candidate["accessStatus"] != "not_selected", "repository access")
            require(candidate["allowedActions"] == ["external_link", "original_bibliographic_reference"],
                    "allowed actions")
        else:
            require(candidate["status"] == "not_selected", "unselected edition status")
            require(candidate["sourceUrl"] is None and candidate["rightsUrl"] is None,
                    "unselected edition must not invent a source")
            require(candidate["rightsStatus"] == "not_verified_exact_edition", "edition rights")
            require(candidate["accessStatus"] == "not_selected", "edition selection")
            require(candidate["allowedActions"] == [], "unselected edition actions")
    separation = data["separationRules"]
    require(separation == {
        "rv1909": "traduccion_no_testigo",
        "sblgnt": "edicion_textual_no_testigo",
        "oshbWlc": "sin_ampliacion_de_admision_P9",
        "na28Ubs5BhsBhq": "aparatos_no_admitidos",
        "alignment": "no_inferir_por_coincidencia_de_referencia",
        "publicRelease": "bloqueado_hasta_P11_4",
    }, "separation rules")
    return {
        "candidates": len(candidates),
        "institutionalRepositories": len(REPOSITORIES),
        "unselectedEditionGroups": len(EXPECTED - REPOSITORIES),
        "admittedWitnesses": 0,
        "corpusImported": 0,
        "publicationAuthorized": False,
    }


if __name__ == "__main__":
    result = validate(json.loads(MANIFEST.read_text(encoding="utf-8")))
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
