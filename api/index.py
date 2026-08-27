import sys
import os

# Vercel only bundles `api/` by default - support both layouts:
# 1) project root has `backend/` (via vercel.json includeFiles)
# 2) api/ has vendored copy at `api/app` (fallback for build)
for p in [
    os.path.join(os.path.dirname(__file__), "..", "backend"),  # -> backend/app
    os.path.join(os.path.dirname(__file__), ".."),              # -> project root (backend/ at root after includeFiles)
    os.path.dirname(__file__),                                   # -> api/app
]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app  # noqa: E402
except ModuleNotFoundError:
    # fallback when vendored under api/app
    from api.app.main import app  # type: ignore  # noqa: E402
