from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile

import build_p11_artifacts as base


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
BASELINE = ROOT / ".baseline" / "maturity-p34-v1"
OLD_ARCHIVE = BASELINE / "package-original.zip"
NEW_ARCHIVE = ARTIFACTS / "lan-ui-v1.zip"
PATCH = ARTIFACTS / "maturity-p34-v1.patch"
BASELINE_ARCHIVE = ARTIFACTS / "maturity-p34-v1-baseline.zip"
ROLLBACK = ARTIFACTS / "rollback-maturity-p34-v1.ps1"


def rollback_script(added: list[str], baseline_count: int, artifact_count: int) -> str:
    return base.rollback_script(added, baseline_count, artifact_count).replace("p11", "p34").replace("P11", "P34")


def main() -> None:
    if not OLD_ARCHIVE.is_file() or not NEW_ARCHIVE.is_file():
        raise FileNotFoundError("P34 baseline and modified package archives are required")
    ARTIFACTS.mkdir(exist_ok=True)
    old_files = base.archive_files(OLD_ARCHIVE)
    new_files = base.archive_files(NEW_ARCHIVE)
    added = sorted(set(new_files) - set(old_files))
    changed = sorted(name for name in set(old_files) & set(new_files) if old_files[name] != new_files[name])
    deleted = sorted(set(old_files) - set(new_files))
    git = base.git_executable()
    with tempfile.TemporaryDirectory(prefix="lan-ui-p34-patch-") as folder:
        repo = Path(folder)
        base.write_tree(repo, old_files)
        base.run_git(git, repo, "init", "-q")
        base.run_git(git, repo, "config", "core.autocrlf", "false")
        base.run_git(git, repo, "config", "user.name", "Lan UI Verifier")
        base.run_git(git, repo, "config", "user.email", "verify@lan-ui.invalid")
        base.run_git(git, repo, "add", "-A")
        base.run_git(git, repo, "commit", "-qm", "P34 baseline")
        for child in repo.iterdir():
            if child.name != ".git":
                shutil.rmtree(child) if child.is_dir() else child.unlink()
        base.write_tree(repo, new_files)
        base.run_git(git, repo, "add", "-A")
        diff = base.run_git(
            git, repo, "diff", "--cached", "--binary", "--full-index", "--no-ext-diff",
            "--src-prefix=a/", "--dst-prefix=b/", capture=True,
        ).stdout
        PATCH.write_bytes(diff)
        base.run_git(git, repo, "reset", "--hard", "HEAD")
        try:
            base.run_git(git, repo, "apply", "--check", "--whitespace=error-all", str(PATCH), capture=True)
        except subprocess.CalledProcessError as error:
            raise RuntimeError(error.stderr.decode("utf-8", errors="replace")) from error
    originals = sorted((BASELINE / "artifacts").glob("*.orig"))
    with zipfile.ZipFile(BASELINE_ARCHIVE, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative, content in old_files.items():
            archive.writestr(f"workspace/{relative}", content)
        for original in originals:
            archive.write(original, f"artifacts/{original.name}")
    ROLLBACK.write_text(rollback_script(added, len(old_files), len(originals)), encoding="utf-8", newline="\n")
    print(f"P34_ARTIFACTS PASS added={len(added)} changed={len(changed)} deleted={len(deleted)} baseline={len(old_files)} artifacts={len(originals)} patch={PATCH.stat().st_size}B")


if __name__ == "__main__":
    main()
