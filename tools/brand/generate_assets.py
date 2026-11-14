#!/usr/bin/env python3
"""Generate InstaHouse's brand assets (icon, adaptive icon, splash, favicon).

Brand: navy #0B1426, amber #FFB020, white. The mark is a bold rounded house
outline with a door — a real-estate glyph that reads at 48 px and is clearly
not Mashinam's car "M". No car, road or steering-wheel hints.

Run from the repo root:
    python3 tools/brand/generate_assets.py

The script only writes the PNGs listed at the bottom; it does not touch app
config. Uses Pillow (bundled with the workspace Python).
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"

NAVY = (11, 20, 38, 255)
NAVY_LIGHT = (22, 34, 58, 255)
AMBER = (255, 176, 32, 255)
WHITE = (255, 255, 255, 255)

SS = 3  # supersampling factor for smooth rounded strokes

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def gradient_background(size: int) -> Image.Image:
    """A calm navy field with a soft lighter centre, like the app background."""
    img = Image.new("RGBA", (size, size), NAVY)
    px = img.load()
    cx = cy = size / 2
    max_d = math.hypot(cx, cy)
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - cx, y - cy) / max_d
            t = max(0.0, 1.0 - d) ** 1.6
            r = int(NAVY[0] + (NAVY_LIGHT[0] - NAVY[0]) * t * 0.85)
            g = int(NAVY[1] + (NAVY_LIGHT[1] - NAVY[1]) * t * 0.85)
            b = int(NAVY[2] + (NAVY_LIGHT[2] - NAVY[2]) * t * 0.85)
            px[x, y] = (r, g, b, 255)
    return img


def rounded_line(draw: ImageDraw.ImageDraw, points, fill, width):
    """Pillow's line has square caps; add circles so the strokes look drawn."""
    pts = [(int(round(x)), int(round(y))) for x, y in points]
    w = max(1, int(round(width)))
    draw.line(pts, fill=fill, width=w, joint="curve")
    r = w / 2
    for x, y in (pts[0], pts[-1]):
        draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)


def draw_house(canvas: Image.Image, cx: float, cy: float, width: float, color=AMBER):
    """Rounded house outline with a door, centred at (cx, cy).

    `width` is the total width of the walls; the roof peak is slightly narrower
    so the silhouette does not look like a square with a hat.
    """
    d = ImageDraw.Draw(canvas)
    h = width * 1.02
    roof_h = h * 0.42
    body_h = h * 0.58
    left = cx - width / 2
    right = cx + width / 2
    shoulder = cy - h / 2 + roof_h
    base = cy + h / 2
    peak = cy - h / 2
    stroke = width * 0.145

    # Roof, then the two walls and the floor slab.
    rounded_line(d, [(left, shoulder), (cx, peak), (right, shoulder)], color, stroke)
    rounded_line(d, [(left, shoulder), (left, base)], color, stroke)
    rounded_line(d, [(right, shoulder), (right, base)], color, stroke)
    rounded_line(d, [(left, base), (right, base)], color, stroke)

    # Door: a rounded rectangle in the brand colour, sitting on the floor slab.
    door_w = width * 0.26
    door_h = body_h * 0.72
    d.rounded_rectangle(
        (cx - door_w / 2, base - door_h, cx + door_w / 2, base),
        radius=door_w * 0.28,
        fill=color,
    )


def draw_plot_line(canvas: Image.Image, cy: float, width: float):
    """A dashed property line under the house — a quiet real-estate hint."""
    d = ImageDraw.Draw(canvas)
    left = (canvas.width - width) / 2
    dash = width * 0.14
    gap = width * 0.07
    x = left
    while x < left + width:
        d.rounded_rectangle(
            (x, cy, min(x + dash, left + width), cy + max(3, width * 0.018)),
            radius=max(2, width * 0.009),
            fill=(255, 255, 255, 120),
        )
        x += dash + gap


def make_icon(size: int = 1024, with_plot: bool = True) -> Image.Image:
    big = gradient_background(size * SS)
    draw_house(big, big.width / 2, big.height * 0.47, big.width * 0.52)
    if with_plot:
        draw_plot_line(big, big.height * 0.86, big.width * 0.40)
    return big.resize((size, size), Image.LANCZOS).convert("RGB")


def make_icon_layer(size: int, color=AMBER) -> Image.Image:
    """Transparent layer for Android adaptive/monochrome icons."""
    big = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    draw_house(big, big.width / 2, big.height * 0.47, big.width * 0.50, color=color)
    return big.resize((size, size), Image.LANCZOS)


def make_background(size: int = 512) -> Image.Image:
    return gradient_background(size).convert("RGB")


def load_font(px: int) -> ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, px)
        except OSError:
            continue
    return ImageFont.load_default()


def make_splash(size: int = 1024) -> Image.Image:
    """Transparent splash artwork; the native splash background is navy."""
    big = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    draw_house(big, big.width / 2, big.height * 0.31, big.width * 0.24)

    font = load_font(int(big.height * 0.098))
    d = ImageDraw.Draw(big)
    text = "InstaHouse"
    box = d.textbbox((0, 0), text, font=font)
    tw = box[2] - box[0]
    tx = (big.width - tw) / 2
    ty = big.height * 0.56
    d.text((tx, ty), text, font=font, fill=WHITE)

    # A short amber rule under the wordmark, matching the app's accent.
    rule_w = big.width * 0.22
    rule_y = big.height * 0.71
    d.rounded_rectangle(
        ((big.width - rule_w) / 2, rule_y, (big.width + rule_w) / 2, rule_y + big.height * 0.008),
        radius=big.height * 0.004,
        fill=AMBER,
    )
    return big.resize((size, size), Image.LANCZOS)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)

    icon = make_icon(1024, with_plot=True)
    icon.save(ASSETS / "icon.png", "PNG")

    make_icon_layer(512, color=AMBER).save(ASSETS / "android-icon-foreground.png", "PNG")
    make_background(512).save(ASSETS / "android-icon-background.png", "PNG")
    make_icon_layer(432, color=WHITE).save(ASSETS / "android-icon-monochrome.png", "PNG")

    make_splash(1024).save(ASSETS / "splash-icon.png", "PNG")

    icon.resize((180, 180), Image.LANCZOS).save(ASSETS / "favicon.png", "PNG")

    print("Wrote:")
    for name in (
        "icon.png",
        "android-icon-foreground.png",
        "android-icon-background.png",
        "android-icon-monochrome.png",
        "splash-icon.png",
        "favicon.png",
    ):
        p = ASSETS / name
        print(f"  {p.relative_to(ROOT)}  {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
