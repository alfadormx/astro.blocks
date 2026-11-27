#!/usr/bin/env python3
"""Export a site guide (Markdown + SVG images) as md, mdx or pdf.

Usage:
  export.py <guide-dir> --format md  [--out DIR]
  export.py <guide-dir> --format mdx [--out FILE.mdx] [--images DIR] [--import-prefix PREFIX]
  export.py <guide-dir> --format pdf [--out FILE.pdf] [--preview SHEET.png]
"""

import argparse
import html as htmllib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

IMAGE_LINE = re.compile(r"^!\[(?P<alt>[^\]]*)\]\((?P<src>images/[^)]+\.svg)\)\s*$", re.M)
MDX_BLOCK = re.compile(r"<!--\s*mdx\s*\n(?P<body>.*?)\n\s*-->\n?", re.S)


REQUIRED_COLORS = ("background", "surface", "ink", "muted", "primary", "accent", "line")


def load(guide_dir: Path) -> tuple[dict, str]:
    guide = json.loads((guide_dir / "guide.json").read_text(encoding="utf-8"))
    missing = [role for role in REQUIRED_COLORS if role not in guide.get("theme", {}).get("colors", {})]
    if missing:
        sys.exit(f"guide.json theme.colors is missing: {', '.join(missing)}")
    md = (guide_dir / guide.get("markdown", "SITE-GUIDE.md")).read_text(encoding="utf-8")
    return guide, md


def images_dir(guide_dir: Path, guide: dict) -> Path:
    """Where the SVGs live. SITE-GUIDE.md always links them as images/<name>.svg."""
    return (guide_dir / guide.get("images", "images")).resolve()


def image_path(guide_dir: Path, guide: dict, src: str) -> Path:
    return images_dir(guide_dir, guide) / Path(src).name


def strip_mdx_blocks(md: str) -> str:
    return MDX_BLOCK.sub("", md)


def split_title(md: str) -> tuple[str, str]:
    match = re.match(r"#\s+(.+)\n", md)
    return (match.group(1).strip(), md[match.end():]) if match else ("", md)


def is_tall(svg: str) -> bool:
    box = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    return bool(box) and float(box.group(2)) > float(box.group(1))


# --- md ---------------------------------------------------------------------


def export_md(guide_dir: Path, guide: dict, out: Path | None) -> Path:
    source = guide_dir / guide.get("markdown", "SITE-GUIDE.md")
    if out is None:
        return source
    out.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, out / source.name)
    shutil.copytree(images_dir(guide_dir, guide), out / "images", dirs_exist_ok=True)
    return out / source.name


# --- mdx --------------------------------------------------------------------


def component_name(src: str) -> str:
    stem = Path(src).stem
    return "Img" + "".join(part.capitalize() for part in re.split(r"[^A-Za-z0-9]+", stem) if part)


def escape_mdx(text: str) -> str:
    """Escape characters MDX would read as JSX, outside inline code."""
    pieces = re.split(r"(`[^`]*`)", text)
    for i, piece in enumerate(pieces):
        if piece.startswith("`"):
            continue
        piece = piece.replace("{", "&#123;").replace("}", "&#125;")
        pieces[i] = piece.replace("<", "&lt;")
    return "".join(pieces)


def frontmatter(values: dict) -> str:
    lines = ["---"]
    for key, value in values.items():
        lines.append(f"{key}: {json.dumps(value, ensure_ascii=False)}")
    lines.append("---")
    return "\n".join(lines)


def format_with_prettier(path: Path) -> None:
    """Format the file with the repo's own prettier, when the repo has one."""
    for folder in [path.parent, *path.parent.parents]:
        prettier = folder / "node_modules" / ".bin" / "prettier"
        if prettier.exists():
            subprocess.run([str(prettier), "--write", str(path)], cwd=folder, check=False, capture_output=True)
            return


def export_mdx(guide_dir: Path, guide: dict, md: str, out: Path | None, images: Path | None, prefix: str | None) -> Path:
    cfg = guide.get("mdx", {})
    title, body = split_title(md)
    if out is None and cfg.get("file"):
        out = (guide_dir / cfg["file"]).resolve()
    out = out or guide_dir / (Path(guide.get("markdown", "SITE-GUIDE.md")).stem + ".mdx")
    if images is None and cfg.get("images"):
        images = (guide_dir / cfg["images"]).resolve()
    images = images or images_dir(guide_dir, guide)
    prefix = prefix if prefix is not None else cfg.get("importPrefix")
    if prefix is None:
        prefix = "./" + os.path.relpath(images, out.parent).replace(os.sep, "/")
    prefix = prefix if prefix.endswith("/") else prefix + "/"
    images.mkdir(parents=True, exist_ok=True)

    imports: dict[str, str] = {}

    def figure(match: re.Match) -> str:
        src, alt = match.group("src"), match.group("alt")
        source = image_path(guide_dir, guide, src)
        if source.resolve() != (images / source.name).resolve():
            shutil.copy2(source, images / source.name)
        name = component_name(src)
        imports[name] = prefix + source.name
        svg = source.read_text(encoding="utf-8")
        size = "{{ width: 'auto', height: 'auto', maxHeight: '90vh', maxWidth: '100%' }}" if is_tall(svg) else "{{ width: '100%', height: 'auto' }}"
        return f"<figure>\n  <{name} role=\"img\" aria-label={{{json.dumps(alt, ensure_ascii=False)}}} style={size} />\n</figure>"

    extra_imports: list[str] = []

    def unwrap(match: re.Match) -> str:
        lines = match.group("body").splitlines()
        extra_imports.extend(line for line in lines if line.startswith("import "))
        kept = "\n".join(line for line in lines if not line.startswith("import ")).strip()
        return f"\x00RAW\n{kept}\n\x00END\n"

    body = MDX_BLOCK.sub(unwrap, body)
    rendered, fenced, raw = [], False, 0
    for line in body.splitlines():
        if line in ("\x00RAW", "\x00END"):
            raw = 1 if line == "\x00RAW" else 0
            continue
        if raw:
            rendered.append(line)
            continue
        if line.lstrip().startswith("```"):
            fenced = not fenced
            rendered.append(line)
            continue
        match = None if fenced else IMAGE_LINE.fullmatch(line.strip())
        rendered.append(figure(match) if match else line if fenced else escape_mdx(line))
    content = re.sub(r"\n{3,}", "\n\n", "\n".join(rendered))

    meta = {"title": title, **cfg.get("frontmatter", {})}
    import_lines = "\n".join(
        [*dict.fromkeys(extra_imports), *(f"import {name} from '{path}';" for name, path in imports.items())]
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(f"{frontmatter(meta)}\n\n{import_lines}\n\n{content.strip()}\n", encoding="utf-8")
    format_with_prettier(out)
    return out


# --- pdf --------------------------------------------------------------------

CSS = """
:root {
  --background: {background}; --surface: {surface}; --ink: {ink}; --muted: {muted};
  --primary: {primary}; --accent: {accent}; --line: {line}; --faint: {faint};
  --font-title: {title_font};
  --font-body: {body_font};
}
@page {
  size: A4;
  margin: 20mm 20mm 22mm;
  background: var(--background);
  @bottom-center {
    content: counter(page);
    font-family: var(--font-body); font-size: 8pt; letter-spacing: 0.2em; color: var(--faint);
  }
}
@page :first { @bottom-center { content: none; } }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  margin: 0; background: var(--background); color: var(--muted);
  font-family: var(--font-body); font-size: 10.5pt; line-height: 1.65; font-weight: 400;
}
h1, h2, h3, h4 { font-family: var(--font-title); color: var(--ink); font-weight: 500; line-height: 1.15; }
h2 {
  break-before: page; font-size: 28pt; margin: 0 0 6mm; padding-bottom: 4mm;
  border-bottom: 1px solid var(--line);
}
h2::before {
  content: attr(data-kicker); display: block; margin-bottom: 3mm;
  font-family: var(--font-body); font-size: 7.5pt; font-weight: 500; letter-spacing: 0.3em;
  text-transform: uppercase; color: var(--primary);
}
h2.flow { break-before: auto; margin-top: 14mm; }
h3 { font-size: 19pt; font-weight: 600; margin: 9mm 0 3mm; break-after: avoid; }
h3 + figure { margin-top: 2mm; }
p { margin: 0 0 3.2mm; orphans: 3; widows: 3; }
strong { color: var(--ink); font-weight: 500; }
em { font-family: var(--font-title); font-size: 1.12em; font-style: italic; }
a { color: var(--primary); text-decoration: none; }
code {
  font-family: var(--font-body); font-size: 0.92em; color: var(--ink);
  background: var(--surface); padding: 0.5mm 1.5mm;
}
ul, ol { margin: 0 0 4mm; padding-left: 5mm; }
li { margin-bottom: 1.4mm; }
ul li::marker, ol li::marker { color: var(--primary); }
li.task { list-style: none; position: relative; }
li.task::before {
  content: ''; position: absolute; left: -5mm; top: 1.6mm; width: 2.6mm; height: 2.6mm;
  border: 1px solid var(--primary);
}
table { width: 100%; border-collapse: collapse; margin: 2mm 0 5mm; font-size: 9.5pt; break-inside: avoid; }
th {
  text-align: left; font-weight: 500; font-size: 7.5pt; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--muted); padding: 2mm 3mm; border-bottom: 1px solid var(--ink);
}
td { padding: 2mm 3mm; border-bottom: 1px solid var(--line); color: var(--ink); }
figure { margin: 4mm 0 5mm; break-inside: avoid; }
figure svg { display: block; width: 100%; height: auto; }
figure.tall { margin: 4mm 0 0; }
figure.tall svg { height: 178mm; width: auto; margin: 0 auto; }
section.part > h3:first-child { margin-top: 0; }
section.page { break-before: page; }
section.page figure, section.first figure { width: 92%; margin-left: auto; margin-right: auto; }
section.card { break-inside: avoid; }
section.card figure { width: 86%; margin: 2mm auto 3mm; }
section.card h3 { margin-top: 7mm; }

.cover {
  height: 255mm; display: flex; flex-direction: column; justify-content: center;
  break-after: page; position: relative;
}
.cover .kicker {
  font-size: 8pt; font-weight: 500; letter-spacing: 0.35em; text-transform: uppercase; color: var(--primary);
}
.cover h1 { font-size: 46pt; font-weight: 400; margin: 6mm 0 8mm; letter-spacing: -0.01em; }
.cover h1 em { font-size: 1em; color: var(--primary); }
.cover .rule { width: 18mm; height: 1px; background: var(--accent); margin-bottom: 8mm; }
.cover p { font-size: 12pt; max-width: 120mm; color: var(--muted); }
.cover .foot {
  position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between;
  font-size: 7.5pt; letter-spacing: 0.3em; text-transform: uppercase; color: var(--faint);
  border-top: 1px solid var(--line); padding-top: 4mm;
}
"""


def chrome_path() -> str:
    candidates = [
        os.environ.get("CHROME_PATH"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        shutil.which("google-chrome"),
        shutil.which("google-chrome-stable"),
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
    ]
    for path in candidates:
        if path and Path(path).exists():
            return path
    sys.exit("PDF export needs Google Chrome or Chromium. Install one, or set CHROME_PATH.")


def pdf_html(guide_dir: Path, guide: dict, md: str) -> str:
    try:
        import markdown
    except ImportError:
        sys.exit("PDF export needs the Python `markdown` package: pip3 install markdown")

    theme, pdf = guide["theme"], guide.get("pdf", {})
    colors = {"faint": theme["colors"].get("muted"), **theme["colors"]}
    css = CSS
    for key, value in {**colors, "title_font": theme["fonts"]["title"], "body_font": theme["fonts"]["body"]}.items():
        css = css.replace("{" + key + "}", value)

    _, body_md = split_title(strip_mdx_blocks(md))
    intro, _, rest = body_md.partition("\n## ")
    body = markdown.markdown("## " + rest, extensions=["tables"])
    lead = markdown.markdown(intro.strip())

    def figure(match: re.Match) -> str:
        svg = image_path(guide_dir, guide, match.group("src")).read_text(encoding="utf-8")
        tall = is_tall(svg)
        svg = re.sub(r'(<svg[^>]*?) width="\d+" height="\d+"', r"\1", svg, count=1)
        label = htmllib.escape(htmllib.unescape(match.group("alt")), quote=True)
        return f'<figure class="{"tall" if tall else ""}" aria-label="{label}">{svg}</figure>'

    body = re.sub(r'<p>\s*<img alt="(?P<alt>[^"]*)" src="(?P<src>images/[^"]+\.svg)"\s*/?>\s*</p>', figure, body)

    kickers = pdf.get("kickers", {})
    per_page = set(pdf.get("pagePerSection", []))
    cards = set(pdf.get("cards", []))
    flow = set(pdf.get("flow", []))
    out, current = [], ""
    for part in re.split(r"(<h2[^>]*>.*?</h2>)", body, flags=re.S):
        if part.startswith("<h2"):
            current = re.sub(r"<[^>]+>", "", part).strip()
            cls = ' class="flow"' if current in flow else ""
            out.append(part.replace("<h2", f'<h2{cls} data-kicker="{kickers.get(current, "")}"', 1))
            continue
        for i, chunk in enumerate(re.split(r"(?=<h3)", part)):
            if not chunk.startswith("<h3"):
                out.append(chunk)
                continue
            if current in per_page:
                cls = "part page" if i > 1 else "part first"
            elif current in cards:
                cls = "part card"
            else:
                cls = "part"
            out.append(f'<section class="{cls}">{chunk}</section>')
    body = re.sub(r"<li>\[ \]\s*", '<li class="task">', "".join(out))

    cover = pdf.get("cover", {})
    fonts = theme.get("googleFonts")
    font_link = f'<link rel="stylesheet" href="{fonts}">' if fonts else ""
    return f"""<!doctype html>
<html lang="{guide.get('language', 'en')}"><head><meta charset="utf-8">
<title>{guide.get('site', '')} — site guide</title>
{font_link}
<style>{css}</style></head>
<body>
<div class="cover">
  <div class="kicker">{cover.get('kicker', '')}</div>
  <h1>{cover.get('title', '')}</h1>
  <div class="rule"></div>
  <div class="lead">{lead}</div>
  <div class="foot"><span>{cover.get('footLeft', '')}</span><span>{cover.get('footRight', '')}</span></div>
</div>
{body}</body></html>"""


def export_pdf(guide_dir: Path, guide: dict, md: str, out: Path | None) -> Path:
    out = out or guide_dir / guide.get("pdf", {}).get("file", "site-guide.pdf")
    document = pdf_html(guide_dir, guide, md)
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "guide.html"
        page.write_text(document, encoding="utf-8")
        subprocess.run(
            [
                chrome_path(),
                "--headless=new",
                "--disable-gpu",
                "--no-pdf-header-footer",
                "--virtual-time-budget=15000",
                f"--print-to-pdf={out.resolve()}",
                page.as_uri(),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    return out


def preview_pdf(pdf: Path, sheet: Path) -> None:
    try:
        import pypdfium2 as pdfium
        from PIL import Image
    except ImportError:
        sys.exit(
            "PDF preview needs pypdfium2 and pillow. Install them outside the project, e.g.\n"
            "  pip3 install --target <scratch>/py pypdfium2 pillow && PYTHONPATH=<scratch>/py python3 export.py ..."
        )
    doc = pdfium.PdfDocument(str(pdf))
    pages = [doc[i].render(scale=0.6).to_pil() for i in range(len(doc))]
    w, h = pages[0].size
    cols = min(7, len(pages))
    canvas = Image.new("RGB", (cols * w, -(-len(pages) // cols) * h), "white")
    for i, page in enumerate(pages):
        canvas.paste(page, ((i % cols) * w, (i // cols) * h))
    canvas.save(sheet)
    print(f"preview → {sheet} ({len(pages)} pages)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("guide_dir", type=Path)
    parser.add_argument("--format", choices=["md", "mdx", "pdf"], required=True)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--images", type=Path, help="mdx: folder to copy the SVGs into")
    parser.add_argument("--import-prefix", help="mdx: import path prefix for the SVGs, e.g. ~/assets/guides/site/")
    parser.add_argument("--preview", type=Path, help="pdf: write a PNG contact sheet of every page")
    args = parser.parse_args()

    guide_dir = args.guide_dir.resolve()
    guide, md = load(guide_dir)
    if args.format == "md":
        result = export_md(guide_dir, guide, args.out)
    elif args.format == "mdx":
        result = export_mdx(guide_dir, guide, md, args.out, args.images, args.import_prefix)
    else:
        result = export_pdf(guide_dir, guide, md, args.out)
        if args.preview:
            preview_pdf(result, args.preview)
    print(result)


if __name__ == "__main__":
    main()
