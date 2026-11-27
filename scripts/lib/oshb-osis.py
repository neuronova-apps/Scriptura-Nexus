"""P8.2.2: isolated OSIS projection; receives already admitted bytes from Node."""
import json
import re
import sys
from collections import Counter
from xml.parsers import expat
from xml.etree import ElementTree as ET

NS = "http://www.bibletechnologies.net/2003/OSIS/namespace"
def q(name):
    return "{" + NS + "}" + name

def reject(*_):
    raise ValueError("DTD, entidades o construcciones externas prohibidas")

def parse(data, book):
    if book not in ("Gen", "Dan"):
        raise ValueError("Libro no autorizado en P8.2.2")
    return _parse_primary(data, book)

def _parse_primary(data, book, *, allow_large_segments=False):
    # Low-level structural parsing; callers must enforce source fingerprints and scope.
    if book not in ("Gen", "Dan", "Lev", "Deut"):
        raise ValueError("Libro fuera del alcance estructural")
    if allow_large_segments and book not in ("Lev", "Deut"):
        raise ValueError("Formato ampliado fuera del alcance")
    if len(data) > 4 * 1024 * 1024:
        raise ValueError("Límite XML superado")
    decoded = data.decode("utf-8", errors="strict")
    if "\ufffd" in decoded:
        raise ValueError("Carácter de sustitución")
    # Expat rejects DTD before processing its declarations; no external resolution.
    guard = expat.ParserCreate(namespace_separator="|")
    guard.StartDoctypeDeclHandler = reject
    guard.EntityDeclHandler = reject
    guard.ExternalEntityRefHandler = reject
    guard.SetParamEntityParsing(expat.XML_PARAM_ENTITY_PARSING_NEVER)
    depth = 0
    def start(*_):
        nonlocal depth
        depth += 1
        if depth > 64:
            raise ValueError("Profundidad XML excesiva")
    def end(*_):
        nonlocal depth
        depth -= 1
    guard.StartElementHandler = start
    guard.EndElementHandler = end
    guard.Parse(data, True)
    root = ET.fromstring(data)
    if root.tag != q("osis"):
        raise ValueError("Raíz o namespace OSIS inválido")
    texts = root.findall(q("osisText"))
    if len(texts) != 1 or texts[0].get("osisIDWork") != "OSHB":
        raise ValueError("Edición OSHB no identificada")
    books = texts[0].findall(q("div"))
    if len(books) != 1 or books[0].get("type") != "book" or books[0].get("osisID") != book:
        raise ValueError("Libro inesperado")
    pending = Counter()
    chapters, seen = [], set()
    def unknown(element, context):
        # Record structure only, never copy note contents or unknown material.
        name = element.tag.removeprefix("{" + NS + "}")
        pending[context + ":" + name] += 1
    def check_text(value, context):
        if value and value.strip():
            pending[context + ":texto_directo"] += 1
    def reference(value, pattern):
        if not value or not re.fullmatch(pattern, value) or value in seen:
            raise ValueError("Referencia OSIS inválida o duplicada")
        seen.add(value)
        return value
    for chapter in books[0]:
        if chapter.tag != q("chapter"):
            unknown(chapter, "libro")
            continue
        cid = reference(chapter.get("osisID"), re.escape(book) + r"\.[1-9]\d*")
        verses = []
        check_text(chapter.text, "capitulo")
        for verse in chapter:
            if verse.tag != q("verse"):
                unknown(verse, "capitulo")
                continue
            vid = reference(verse.get("osisID"), re.escape(cid) + r"\.[1-9]\d*[a-z]?")
            events = []
            alternatives = []
            check_text(verse.text, "versiculo")
            for child in verse:
                if allow_large_segments and child.tag == q("w") and len(child):
                    # Only the attested OSHB typographic segment is supported.
                    # Preserve Unicode codepoints, tails and segment offsets; no normalization.
                    if any(c.tag != q("seg") or c.attrib != {"type":"x-large"} or len(c) or not c.text for c in child):
                        unknown(child, "versiculo")
                        raise ValueError("Estructura interna de palabra no admitida")
                    form = child.text or ""
                    spans = []
                    for c in child:
                        spans.append({"type":"x-large","start":len(form),"length":len(c.text)})
                        form += c.text + (c.tail or "")
                    if not form.strip():
                        raise ValueError("Forma textual vacía")
                    events.append({"kind":"word","form":form,"providerId":child.get("id"),
                        "type":child.get("type"),"lemmaRaw":child.get("lemma"),"morphRaw":child.get("morph"),
                        "letterSegments":spans})
                elif child.tag in (q("w"), q("seg")) and len(child) == 0:
                    form = child.text
                    if not form or not form.strip():
                        raise ValueError("Forma textual vacía")
                    if child.tag == q("w"):
                        events.append({"kind":"word","form":form,"providerId":child.get("id"),
                            "type":child.get("type"),"lemmaRaw":child.get("lemma"),
                            "morphRaw":child.get("morph")})
                    else:
                        events.append({"kind":"segment","form":form,"type":child.get("type")})
                else:
                    unknown(child, "versiculo")
                    if child.tag == q("note") and child.get("type") == "variant":
                        for index, reading in enumerate(child):
                            if reading.tag != q("rdg") or reading.get("type") != "x-qere":
                                continue
                            words = []
                            if any(w.tag != q("w") or len(w) or not w.text or not w.text.strip() for w in reading):
                                pending["variante:qere_no_resuelta"] += 1
                                continue
                            if reading.text and reading.text.strip() or any(w.tail and w.tail.strip() for w in reading):
                                pending["variante:qere_no_resuelta"] += 1
                                continue
                            for w in reading:
                                words.append({"kind":"word","form":w.text,"providerId":w.get("id"),
                                    "type":w.get("type"),"lemmaRaw":w.get("lemma"),"morphRaw":w.get("morph")})
                            if words:
                                alternatives.append({"kind":"qere","noteChildIndex":index,
                                    "afterEvent":len(events)-1,"words":words})

                check_text(child.tail, "versiculo")
            if not any(e["kind"] == "word" for e in events):
                raise ValueError("Versículo sin palabras directas")
            verses.append({"reference":vid,"events":events,**({"alternatives":alternatives} if alternatives else {})})
            check_text(verse.tail, "capitulo")
        if not verses:
            raise ValueError("Capítulo sin versículos")
        chapters.append({"reference":cid,"verses":verses})
        check_text(chapter.tail, "libro")
    if not chapters:
        raise ValueError("Libro sin capítulos")
    return {"book":book,"chapters":chapters,"pendingStructures":dict(sorted(pending.items()))}

if __name__ == "__main__":
    try:
        result = parse(sys.stdin.buffer.read(4 * 1024 * 1024 + 1), sys.argv[1])
        print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    except (ValueError, expat.ExpatError, ET.ParseError, IndexError):
        # Do not echo source text or potentially restricted content.
        print("XML OSIS rechazado: estructura, codificación o seguridad inválida", file=sys.stderr)
        sys.exit(1)
