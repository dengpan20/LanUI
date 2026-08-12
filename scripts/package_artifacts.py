from pathlib import Path
import difflib
import hashlib
import json
import os
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)

# The repository contained only .git when work started. Preserve that state as a
# canonical empty-tree manifest and hash rather than inventing an original file.
baseline = {"kind": "empty-workspace", "tracked_files": []}
baseline_bytes = (json.dumps(baseline, ensure_ascii=False, sort_keys=True) + "\n").encode()
(ROOT / ".baseline" / "manifest.json").write_bytes(baseline_bytes)
(ROOT / ".baseline" / "manifest.sha256").write_text(
    hashlib.sha256(baseline_bytes).hexdigest() + "  manifest.json\n", encoding="utf-8"
)

excluded_dirs = {".git", ".baseline", "node_modules", "dist", "dist-lib", "artifacts", ".verify", "button-fix", "feedback-select-fix", "form-system-sync", "component-expansion", "table-system-v1", "feedback-form-system-v1", "system-completion-v2", "__pycache__"}
source_files = []
for current, directories, files in os.walk(ROOT):
    directories[:] = sorted(name for name in directories if name not in excluded_dirs)
    folder = Path(current)
    source_files.extend(folder / name for name in sorted(files))
source_files.sort()

# Unified source patch against the empty baseline.
patch_chunks = []
for path in source_files:
    rel = path.relative_to(ROOT).as_posix()
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    lines = text.splitlines(keepends=True)
    patch_chunks.extend(difflib.unified_diff([], lines, fromfile="/dev/null", tofile=f"b/{rel}"))
(ARTIFACTS / "lan-ui-v1.patch").write_text("".join(patch_chunks), encoding="utf-8", newline="\n")

# Source + verified production build, ready to hand off.
zip_path = ARTIFACTS / "lan-ui-v1.zip"
with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for path in source_files:
        zf.write(path, path.relative_to(ROOT).as_posix())
    for path in sorted((ROOT / "dist").rglob("*")):
        if path.is_file():
            zf.write(path, path.relative_to(ROOT).as_posix())
    for path in sorted((ROOT / "dist-lib").rglob("*")):
        if path.is_file():
            zf.write(path, path.relative_to(ROOT).as_posix())

print(f"source_files={len(source_files)}")
print(f"patch={ARTIFACTS / 'lan-ui-v1.patch'}")
print(f"archive={zip_path}")
