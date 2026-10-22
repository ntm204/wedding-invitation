# In link riêng cho từng khách trong js/guests.js. Dùng: python3 scripts/links.py https://<địa chỉ thiệp>
import pathlib
import re
import sys
import urllib.parse

base = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000").rstrip("/")
src = (pathlib.Path(__file__).resolve().parent.parent / "js" / "guests.js").read_text(encoding="utf-8")

for code, name in re.findall(r"'([^']+)'\s*:\s*'([^']*)'", src):
    print(f"{name}\t{base}/?m={urllib.parse.quote(code)}")
