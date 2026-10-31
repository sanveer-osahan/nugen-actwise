"""Split the Income-tax Act, 2025 text into sections.

Input:  data/text/income-tax-act-2025-as-amended-by-finance-act-2026.txt (pdftotext -layout)
Output: data/processed/act_sections.jsonl, one JSON object per section:
        {"section": "123", "heading": "...", "chapter": "...", "text": "..."}
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data/text/income-tax-act-2025-as-amended-by-finance-act-2026.txt"
OUT = ROOT / "data/processed/act_sections.jsonl"

SECTION_START = re.compile(r"^(\d{1,3})([A-Z]{0,2})\.­?(?:\s|$)")
SCHEDULE = re.compile(r"^SCHEDULE\s+([IVXLC]+)\s*$")
PART_TITLE = re.compile(r"^[A-Z]{1,2}\.—")
OLD_REF = re.compile(r"\s*\[Ss?\.\s[^\]]*of the 1961 Act\]")
HEADING_END = (".", ";", ":", "—", ")", ",", "]")
CHAPTER = re.compile(r"^CHAPTER\s+([IVXLC]+(?:-[A-Z])?)\s*$")
PAGE_NOISE = re.compile(r"^\s*(\d+\s*$|\*Assented)")


def heading_before(lines: list[str], i: int) -> list[str]:
    """Return the marginal heading lines just above line i (1 to 3 lines)."""
    out: list[str] = []
    j = i - 1
    while j >= 0 and not lines[j].strip():
        j -= 1
    if j < 0:
        return out
    first = lines[j].strip()
    if PART_TITLE.match(first):
        return out
    out.insert(0, first)
    j -= 1
    # Join wrapped heading lines: the line above belongs to the heading when it
    # does not end like the last line of a sentence.
    while j >= 0 and len(out) < 3:
        prev = lines[j].strip()
        if not prev or prev.endswith(HEADING_END) or CHAPTER.match(prev) or prev.isupper() or PART_TITLE.match(prev):
            break
        out.insert(0, prev)
        j -= 1
    return out


def main() -> None:
    lines = SRC.read_text(encoding="utf-8").splitlines()
    sections: list[dict] = []
    current: dict | None = None
    chapter = ""
    expected = 1

    for i, raw in enumerate(lines):
        line = raw.strip()
        if m := CHAPTER.match(line):
            chapter = m.group(1)
            continue
        if m := SCHEDULE.match(line):
            if current:
                sections.append(current)
            current = {"section": f"Schedule {m.group(1)}", "heading": "", "chapter": "", "text": []}
            expected = 10_000  # no more numbered sections after the Schedules start
            continue
        if current and current["section"].startswith("Schedule") and not current["heading"] and line:
            current["heading"] = line
            continue
        # Real section starts sit at or near column 0; indented matches are table rows or footnotes.
        m = SECTION_START.match(line) if len(raw) - len(raw.lstrip()) <= 1 else None
        # Accept only the next section number in order (or an inserted section
        # with a letter suffix, such as 93A). This skips numbered list items and
        # cross-references that start a line.
        if m:
            num, suffix = int(m.group(1)), m.group(2)
            is_next = num == expected and not suffix
            is_inserted = num == expected - 1 and suffix
        if m and (is_next or is_inserted):
            heading_lines = heading_before(lines, i)
            if current:
                # The heading lines were appended to the previous section; remove them.
                del current["text"][len(current["text"]) - len(heading_lines):]
                sections.append(current)
            heading = OLD_REF.sub("", " ".join(heading_lines))
            heading = re.sub(r"-\s+", "", heading).rstrip(".")
            current = {
                "section": m.group(1) + suffix,
                "heading": heading,
                "chapter": chapter,
                "text": [line],
            }
            if is_next:
                expected += 1
            continue
        if current and line and not PAGE_NOISE.match(line):
            current["text"].append(line)

    if current:
        sections.append(current)

    with OUT.open("w", encoding="utf-8") as f:
        for s in sections:
            s["text"] = " ".join(s["text"])
            f.write(json.dumps(s, ensure_ascii=False) + "\n")
    print(f"{len(sections)} sections -> {OUT.relative_to(ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
