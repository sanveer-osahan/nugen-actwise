"""Check benchmark questions against the official source texts.

Usage: python3 scripts/check_benchmark.py benchmark/questions.jsonl [more.jsonl ...]

Each line is a JSON object with at least:
  id, category, question, answer, source, section, evidence

`source` is a file name in data/text/ without ".txt".
`evidence` is one quote, or a list of quotes. Every quote must appear in the
source text after normalisation (whitespace, line-end hyphens, quote marks).
The script exits with code 1 when any check fails.
"""

import json
import re
import sys
from functools import cache
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_DIR = ROOT / "data/text"
SECTIONS = ROOT / "data/processed/act_sections.jsonl"
ACT = "income-tax-act-2025-as-amended-by-finance-act-2026"
REQUIRED = ["id", "category", "question", "answer", "source", "section", "evidence"]


def normalise(text: str) -> str:
    text = text.replace("­", "")
    text = re.sub(r"[“”]", '"', text)
    text = re.sub(r"[‘’]", "'", text)
    text = re.sub(r"[–—]", "-", text)
    text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)  # join words split at line end
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\(\s+", "(", text)
    return text.strip().lower()


@cache
def source_text(name: str) -> str:
    path = TEXT_DIR / f"{name}.txt"
    if not path.exists():
        raise FileNotFoundError(f"unknown source '{name}' (no {path.relative_to(ROOT)})")
    return normalise(path.read_text(encoding="utf-8"))


@cache
def act_sections() -> dict[str, str]:
    rows = (json.loads(line) for line in SECTIONS.read_text(encoding="utf-8").splitlines())
    return {r["section"]: normalise(r["text"]) for r in rows}


def check(row: dict) -> list[str]:
    errors = [f"missing field '{k}'" for k in REQUIRED if not row.get(k)]
    if errors:
        return errors
    quotes = row["evidence"] if isinstance(row["evidence"], list) else [row["evidence"]]
    try:
        text = source_text(row["source"])
    except FileNotFoundError as e:
        return [str(e)]
    for q in quotes:
        nq = normalise(q)
        if len(nq) < 15:
            errors.append(f"evidence too short: {q!r}")
        elif nq not in text:
            errors.append(f"evidence not found in {row['source']}: {q[:90]!r}")
    # For Act questions, the evidence must sit in the cited section.
    if row["source"] == ACT and not errors:
        sec = str(row["section"]).split("(")[0].strip()
        body = act_sections().get(sec)
        if body is None:
            errors.append(f"section {sec} not found in the Act")
        else:
            for q in quotes:
                if normalise(q) not in body:
                    errors.append(f"evidence is in the Act but not in section {sec}: {q[:70]!r}")
    return errors


def main(paths: list[str]) -> int:
    seen: set[str] = set()
    failed = total = 0
    for path in paths:
        for n, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
            if not line.strip():
                continue
            total += 1
            try:
                row = json.loads(line)
            except json.JSONDecodeError as e:
                print(f"{path}:{n}: invalid JSON: {e}")
                failed += 1
                continue
            errors = check(row)
            if row.get("id") in seen:
                errors.append(f"duplicate id {row['id']}")
            seen.add(row.get("id"))
            if errors:
                failed += 1
                for e in errors:
                    print(f"{path}:{n} [{row.get('id')}]: {e}")
    print(f"{total - failed}/{total} questions pass")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
