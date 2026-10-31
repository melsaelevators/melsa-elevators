"""Make small copies of the photos the profile uses (tools/profile/cache, not committed).
Run before build.mjs so the PDFs stay light: python3 tools/profile/shrink.py"""
import os, glob
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "assets")
OUT = os.path.join(os.path.dirname(__file__), "cache")
pats = ["private/[0-9][0-9].webp", "hero/*.jpg", "projects/*/*.jpg", "team/*.jpg", "thumbs-lg/*.jpg", "cabin_designs_*.jpg", "clients/*.png", "logo.png", "logo-light.png"]
for pat in pats:
    for f in glob.glob(os.path.join(ROOT, pat)):
        rel = os.path.relpath(f, ROOT); dst = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im = Image.open(f)
        if f.endswith(".webp"):  # Chrome puts WebP into PDFs uncompressed, so keep a JPEG copy
            dst = dst[:-5] + ".jpg"
        if f.endswith(".png"):
            im.thumbnail((320, 320)); im.save(dst, optimize=True)
        else:
            im = im.convert("RGB"); im.thumbnail((1000, 1000)); im.save(dst, quality=70, optimize=True, progressive=True)
print("cache ready")
