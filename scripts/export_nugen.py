"""Export the benchmark to the JSON format that Nugen's /benchmarks/upload expects.

Usage: python3 scripts/export_nugen.py [benchmark/questions.jsonl] [benchmark/nugen_benchmark.json]

Nugen wants one JSON array of objects:
  {"sample_num": int, "instruction": str, "response": str}
The script runs the evidence checks first and stops if any question fails.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_benchmark import main as check  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def export(src: Path, dst: Path) -> None:
    rows = [json.loads(line) for line in src.read_text(encoding="utf-8").splitlines() if line.strip()]
    samples = [
        {"sample_num": n, "instruction": row["question"], "response": row["answer"]}
        for n, row in enumerate(rows, 1)
    ]
    dst.write_text(json.dumps(samples, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(samples)} samples to {dst}")


if __name__ == "__main__":
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "benchmark/questions.jsonl"
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "benchmark/nugen_benchmark.json"
    if check([str(src)]) != 0:
        sys.exit("export stopped: fix the failed questions first")
    export(src.resolve(), dst.resolve())
