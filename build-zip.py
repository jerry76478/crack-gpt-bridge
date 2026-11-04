"""Build the updater archive from the public bridge program files."""
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parent
bridge = root / "termux-bridge"
version = json.loads((bridge / "package.json").read_text(encoding="utf-8"))["version"]
files = (
    "LICENSE", "README.md", "install-termux.sh", "package.json", "start-windows.ps1",
    "start.sh", "update-termux.sh", "src/auth.mjs", "src/dashboard.html",
    "src/dashboard.js", "src/jobs.mjs", "src/server.mjs", "src/start.mjs",
)
releases = root / "releases"
releases.mkdir(exist_ok=True)
with ZipFile(releases / f"crack-gpt-bridge_{version}.zip", "w") as archive:
    for name in sorted(files):
        entry = ZipInfo("crack-gpt-bridge/termux-bridge/" + name, (2026, 1, 1, 0, 0, 0))
        entry.create_system = 3
        entry.external_attr = (0o100755 if name.endswith(".sh") else 0o100644) << 16
        archive.writestr(entry, (bridge / name).read_bytes(), compress_type=ZIP_DEFLATED)

