from pathlib import Path
import hashlib
import os
import shutil
import subprocess
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
BASELINE = ROOT / ".baseline" / "maturity-p9-v1"
OLD_ARCHIVE = BASELINE / "package-original.zip"
NEW_ARCHIVE = ARTIFACTS / "lan-ui-v1.zip"
PATCH = ARTIFACTS / "maturity-p9-v1.patch"
BASELINE_ARCHIVE = ARTIFACTS / "maturity-p9-v1-baseline.zip"
ROLLBACK = ARTIFACTS / "rollback-maturity-p9-v1.ps1"
GENERATED_PREFIXES = ("dist/", "dist-lib/", "artifacts/", ".baseline/", ".verify/")


def is_source(name: str) -> bool:
    normalized = name.replace("\\", "/").lstrip("./")
    return normalized and not normalized.endswith("/") and not normalized.startswith(GENERATED_PREFIXES)


def archive_files(path: Path) -> dict[str, bytes]:
    with zipfile.ZipFile(path) as archive:
        return {
            info.filename.replace("\\", "/"): archive.read(info)
            for info in archive.infolist()
            if is_source(info.filename)
        }


def write_tree(target: Path, files: dict[str, bytes]) -> None:
    for relative, content in files.items():
        destination = target / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)


def git_executable() -> str:
    configured = os.environ.get("GIT_EXE")
    if configured and Path(configured).is_file():
        return configured
    found = shutil.which("git")
    if found:
        return found
    bundled = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe"
    if bundled.is_file():
        return str(bundled)
    raise RuntimeError("Git executable was not found")


def run_git(git: str, cwd: Path, *args: str, capture: bool = False) -> subprocess.CompletedProcess:
    return subprocess.run(
        [git, *args], cwd=cwd, check=True,
        stdout=subprocess.PIPE if capture else subprocess.DEVNULL,
        stderr=subprocess.PIPE if capture else subprocess.DEVNULL,
    )


def ps_array(items: list[str]) -> str:
    quoted = [f"    '{item.replace('/', chr(92)).replace(chr(39), chr(39) * 2)}'" for item in items]
    return ",\n".join(quoted)


def rollback_script(added: list[str], baseline_count: int) -> str:
    p9_roles = [
        "maturity-p9-v1-baseline.zip", "maturity-p9-v1.patch",
        "maturity-p9-v1-verification.md", "maturity-p9-v1.sha256",
        "rollback-maturity-p9-v1.ps1",
    ]
    return f"""param(
  [string]$TargetRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $TargetRoot).Path
if (-not (Test-Path -LiteralPath (Join-Path $root 'package.json') -PathType Leaf)) {{
  throw "TargetRoot is not a Lan UI workspace: $root"
}}

$archive = Join-Path $PSScriptRoot 'maturity-p9-v1-baseline.zip'
if (-not (Test-Path -LiteralPath $archive -PathType Leaf)) {{ throw "Missing baseline archive: $archive" }}
$temp = Join-Path ([IO.Path]::GetTempPath()) ("lan-ui-rollback-p9-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp | Out-Null

try {{
  Expand-Archive -LiteralPath $archive -DestinationPath $temp -Force
  $workspace = Join-Path $temp 'workspace'
  $added = @(
{ps_array(added)}
  )

  foreach ($relative in $added) {{
    $target = [IO.Path]::GetFullPath((Join-Path $root $relative))
    if (-not $target.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {{ throw "Unsafe added-file target: $target" }}
    if (Test-Path -LiteralPath $target -PathType Leaf) {{ Remove-Item -LiteralPath $target -Force }}
  }}

  foreach ($relative in @('dist', 'dist-lib', 'examples\\standalone-vue\\dist')) {{
    $target = [IO.Path]::GetFullPath((Join-Path $root $relative))
    if (-not $target.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {{ throw "Unsafe generated target: $target" }}
    if (Test-Path -LiteralPath $target) {{ Remove-Item -LiteralPath $target -Recurse -Force }}
  }}

  $baselineFiles = Get-ChildItem -LiteralPath $workspace -Recurse -File
  foreach ($file in $baselineFiles) {{
    $relative = $file.FullName.Substring($workspace.Length).TrimStart('\\', '/')
    $destination = [IO.Path]::GetFullPath((Join-Path $root $relative))
    if (-not $destination.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {{ throw "Unsafe restore target: $destination" }}
    $parent = Split-Path -Parent $destination
    if (-not (Test-Path -LiteralPath $parent)) {{ New-Item -ItemType Directory -Path $parent -Force | Out-Null }}
    Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
  }}

  $artifactRestore = [ordered]@{{
    'lan-ui-v1.zip.orig' = 'lan-ui-v1.zip'
    'lan-ui-v1.patch.orig' = 'lan-ui-v1.patch'
    'maturity-p8-v1.patch.orig' = 'maturity-p8-v1.patch'
    'maturity-p8-v1-verification.md.orig' = 'maturity-p8-v1-verification.md'
    'maturity-p8-v1.sha256.orig' = 'maturity-p8-v1.sha256'
    'maturity-p8-v1-baseline.zip.orig' = 'maturity-p8-v1-baseline.zip'
    'rollback-maturity-p8-v1.ps1.orig' = 'rollback-maturity-p8-v1.ps1'
  }}
  $targetArtifacts = Join-Path $root 'artifacts'
  if (-not (Test-Path -LiteralPath $targetArtifacts)) {{ New-Item -ItemType Directory -Path $targetArtifacts -Force | Out-Null }}
  foreach ($entry in $artifactRestore.GetEnumerator()) {{
    Copy-Item -LiteralPath (Join-Path (Join-Path $temp 'artifacts') $entry.Key) -Destination (Join-Path $targetArtifacts $entry.Value) -Force
  }}

  $mismatches = @()
  foreach ($file in $baselineFiles) {{
    $relative = $file.FullName.Substring($workspace.Length).TrimStart('\\', '/')
    $expected = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    $actual = (Get-FileHash -LiteralPath (Join-Path $root $relative) -Algorithm SHA256).Hash
    if ($expected -ne $actual) {{ $mismatches += $relative }}
  }}
  foreach ($relative in $added) {{ if (Test-Path -LiteralPath (Join-Path $root $relative)) {{ $mismatches += "added:$relative" }} }}
  if ($mismatches.Count) {{ throw "Rollback hash mismatch: $($mismatches -join ', ')" }}

  $p9Roles = @(
{ps_array(p9_roles)}
  )
  foreach ($relative in $p9Roles) {{
    $target = Join-Path $targetArtifacts $relative
    if (Test-Path -LiteralPath $target -PathType Leaf) {{ Remove-Item -LiteralPath $target -Force }}
  }}
  Write-Output "ROLLBACK PASS restored={baseline_count} removed=$($added.Count) generated=dist,dist-lib artifacts=$($artifactRestore.Count) target=$root"
}}
finally {{
  if (Test-Path -LiteralPath $temp) {{ Remove-Item -LiteralPath $temp -Recurse -Force }}
}}
"""


def main() -> None:
    if not OLD_ARCHIVE.is_file() or not NEW_ARCHIVE.is_file():
        raise FileNotFoundError("P9 baseline and modified package archives are required")
    ARTIFACTS.mkdir(exist_ok=True)
    old_files = archive_files(OLD_ARCHIVE)
    new_files = archive_files(NEW_ARCHIVE)
    added = sorted(set(new_files) - set(old_files))
    changed = sorted(name for name in set(old_files) & set(new_files) if old_files[name] != new_files[name])
    deleted = sorted(set(old_files) - set(new_files))

    git = git_executable()
    with tempfile.TemporaryDirectory(prefix="lan-ui-p9-patch-") as folder:
        repo = Path(folder)
        write_tree(repo, old_files)
        run_git(git, repo, "init", "-q")
        run_git(git, repo, "config", "core.autocrlf", "false")
        run_git(git, repo, "config", "user.name", "Lan UI Verifier")
        run_git(git, repo, "config", "user.email", "verify@lan-ui.invalid")
        run_git(git, repo, "add", "-A")
        run_git(git, repo, "commit", "-qm", "P9 baseline")
        for child in repo.iterdir():
            if child.name == ".git":
                continue
            shutil.rmtree(child) if child.is_dir() else child.unlink()
        write_tree(repo, new_files)
        run_git(git, repo, "add", "-A")
        diff = run_git(
            git, repo, "diff", "--cached", "--binary", "--full-index", "--no-ext-diff",
            "--src-prefix=a/", "--dst-prefix=b/", capture=True,
        ).stdout
        PATCH.write_bytes(diff)
        run_git(git, repo, "reset", "--hard", "HEAD")
        run_git(git, repo, "apply", "--check", "--whitespace=error-all", str(PATCH))

    with zipfile.ZipFile(BASELINE_ARCHIVE, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative, content in old_files.items():
            archive.writestr(f"workspace/{relative}", content)
        archive.write(OLD_ARCHIVE, "artifacts/lan-ui-v1.zip.orig")
        for name in ["lan-ui-v1.patch.orig", "maturity-p8-v1.patch.orig", "maturity-p8-v1-verification.md.orig", "maturity-p8-v1.sha256.orig", "maturity-p8-v1-baseline.zip.orig", "rollback-maturity-p8-v1.ps1.orig"]:
            archive.write(BASELINE / "artifacts" / name, f"artifacts/{name}")

    ROLLBACK.write_text(rollback_script(added, len(old_files)), encoding="utf-8", newline="\n")
    print(f"P9_ARTIFACTS PASS added={len(added)} changed={len(changed)} deleted={len(deleted)} baseline={len(old_files)} patch={PATCH.stat().st_size}B")


if __name__ == "__main__":
    main()
