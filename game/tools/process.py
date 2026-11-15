"""Asset pipeline for prototypes/game-v2.

Run from anywhere:  python tools/process.py   (paths are relative to the game folder;
an optional argument overrides the game folder). Needs Pillow, NumPy and SciPy.
Inputs: raw-assets/. Outputs: assets/ and qa/ (contact sheet, edge check, report).

- Detects each image's own key green, removes it with a soft matte computed against the
  local foreground colour (so natural greens next to the key survive), despills, removes
  stray specks.
- Builds the character sheet + Phaser JSON-hash atlas, cuts props / keeper into named
  sprites, colour-grades parallax layers per world, writes a checkerboard contact sheet.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage as ndi

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
RAW = ROOT / "raw-assets"
OUT = ROOT / "assets"
QA = ROOT / "qa"
for d in (OUT, OUT / "props", OUT / "keeper", OUT / "layers", OUT / "fx", QA):
    d.mkdir(parents=True, exist_ok=True)

REPORT = {}


def load(name):
    return np.asarray(Image.open(RAW / name).convert("RGB")).astype(np.float32)


def green_excess(a):
    return a[..., 1] - np.maximum(a[..., 0], a[..., 2])


def detect_key(a):
    e = green_excess(a)
    m = (e > 120) & (a[..., 1] > 150)
    if m.mean() < 0.02:
        return None, m
    return np.median(a[m], axis=0), m


def box_mean(img, mask, r):
    """Mean of img over mask inside a (2r+1)^2 window (img HxWxC, mask HxW bool)."""
    w = mask.astype(np.float32)
    k = 2 * r + 1
    num = np.stack([ndi.uniform_filter(img[..., c] * w, k, mode="nearest") for c in range(3)], -1)
    den = ndi.uniform_filter(w, k, mode="nearest")
    return num / np.maximum(den[..., None], 1e-6), den


def key_out(a, min_speck=40, band_r=3):
    key, _ = detect_key(a)
    if key is None:
        return None, None
    e = green_excess(a)
    ek = key[1] - max(key[0], key[2])
    # 1. hard key: clearly key-green and bright (dark natural greens never qualify)
    hard = (e > 0.55 * ek) & (a[..., 1] > 0.55 * key[1])
    # drop tiny "key" islands (green highlights inside artwork), keep real holes
    lab, n = ndi.label(hard)
    if n:
        sizes = ndi.sum(hard, lab, range(1, n + 1))
        hard = np.isin(lab, np.nonzero(sizes >= 3)[0] + 1)  # sky gaps between leaves are real holes
    # 2. boundary band where blended pixels live
    near = ndi.binary_dilation(hard, iterations=band_r) & ~hard
    solid = ~hard & ~near
    # local foreground colour from solid pixels a little further in
    fg, den = box_mean(a, solid, band_r + 2)
    have_fg = den > 1e-3
    # 3. alpha by projecting the pixel onto the key -> local-fg line
    d_kf = fg - key
    d_kc = a - key
    proj = (d_kc * d_kf).sum(-1) / np.maximum((d_kf * d_kf).sum(-1), 1.0)
    # fallback ramp on green excess when no fg sample is nearby
    ramp = np.clip((0.55 * ek - e) / (0.55 * ek - 20), 0, 1)
    alpha_band = np.where(have_fg, np.clip(proj, 0, 1), ramp)
    alpha = np.where(hard, 0.0, np.where(near, alpha_band, 1.0))
    alpha[alpha > 0.94] = 1.0
    alpha[alpha < 0.10] = 0.0
    # 4. unmix colour in the band, then despill: green may not exceed the local fg's
    #    green dominance (keeps natural greens, kills lime fringe)
    safe = np.maximum(alpha, 0.1)[..., None]
    unmixed = np.clip((a - (1 - alpha[..., None]) * key) / safe, 0, 255)
    col = np.where(near[..., None], unmixed, a)
    fg_ex = np.where(have_fg, green_excess(fg), 0)
    # natural greens in this art are yellowish (r > b) and never key-bright; spill is
    # key-hued (r ~ b) or as bright as the key -> those get no natural-green allowance
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    yel = np.clip((r_ - b_) / np.maximum(g_ - np.minimum(r_, b_) + 1, 1), 0, 1)
    natural_w = np.clip(yel * 2.5, 0, 1) * (g_ < 0.8 * key[1])
    allowed = np.maximum(col[..., 0], col[..., 2]) + np.maximum(fg_ex, 0) * natural_w + 6
    spill_zone = ndi.binary_dilation(hard, iterations=band_r + 1)
    col[..., 1] = np.where(spill_zone, np.minimum(col[..., 1], allowed), col[..., 1])
    # 5. stray specks
    # 4b. key green seen *through* glass / glow inside solid areas: bright and key-hued
    #     (red ~ blue). Natural greens in this art are darker or yellowish, so untouched.
    cr, cg, cb = col[..., 0], col[..., 1], col[..., 2]
    ex = cg - np.maximum(cr, cb)
    keyish = (cg > 0.5 * key[1]) & (ex > 35) & ((cr - cb) < 0.4 * ex)
    col[..., 1] = np.where(keyish, np.maximum(cr, cb) + 0.12 * ex, cg)
    REPORT.setdefault("through_key_px", {})[str(round(float(key[1])))] = int(keyish.sum())
    vis = alpha > 0
    lab, n = ndi.label(vis)
    if n:
        sizes = ndi.sum(vis, lab, range(1, n + 1))
        keep = np.isin(lab, np.nonzero(sizes >= min_speck)[0] + 1)
        alpha = np.where(keep, alpha, 0)
    rgba = np.dstack([col, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    rgba[alpha == 0, :3] = 0
    return rgba, key


def to_img(rgba):
    return Image.fromarray(rgba, "RGBA")


def trim(im, pad=2):
    bb = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bb)
    out = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad))
    out.paste(im, (pad, pad))
    return out


def save_webp(im, path, lossless=False, q=90):
    if lossless:
        im.save(path, "WEBP", lossless=True, quality=100, method=6)
    else:
        im.save(path, "WEBP", quality=q, alpha_quality=100, method=6)


def components(rgba, merge=14, min_area=400):
    """Bounding boxes of sprite islands; islands closer than `merge` px join one sprite."""
    vis = rgba[..., 3] > 0
    grown = ndi.binary_dilation(vis, iterations=merge)
    lab, n = ndi.label(grown)
    boxes = []
    for sl in ndi.find_objects(lab):
        ys, xs = sl
        if (ys.stop - ys.start) * (xs.stop - xs.start) < min_area:
            continue
        boxes.append((xs.start, ys.start, xs.stop, ys.stop))
    return boxes, lab


# ---------------------------------------------------------------- character
# Single-pose frames come from their own files. The run cycle comes from run-sheet.png
# (6 frames in one row, arms/legs alternating: 1-3 one phase, 4-6 the other).
SINGLE = [("idle", "nurlan-base.webp"), ("jump", "jump.webp"), ("fall", "fall.webp"), ("kick", "kick.webp")]
RUN_SHEET = "run-sheet.png"
RUN_FRAMES = 6
CHAR_SCALE = 0.30          # idle ~ 260 px tall: 2x of a ~130-unit tall in-game hero
frames = {}
keys_used = {}
head_w = {}
REPORT["run_sheet"] = {}


def head_width(a):
    """Median opaque width of the rows 4%..10% down the figure (the head)."""
    ys, _ = np.nonzero(a)
    top, bot = ys.min(), ys.max()
    return float(np.median(a[top + int(0.04 * (bot - top)): top + int(0.10 * (bot - top))].sum(1)))


sources = []
for name, fn in SINGLE:
    rgba, key = key_out(load(fn), min_speck=60)
    keys_used[fn] = key.round().tolist()
    sources.append((name, rgba))
HEAD_REF = float(np.median([head_width(r[..., 3] > 0) for _, r in sources]))   # ~121 px

# run cycle: key the sheet, cut the 6 figures, scale each so its head matches HEAD_REF
rgba, key = key_out(load(RUN_SHEET), min_speck=60)
keys_used[RUN_SHEET] = key.round().tolist()
boxes, _ = components(rgba, merge=4)
boxes = sorted(boxes, key=lambda b: b[0])
assert len(boxes) == RUN_FRAMES, f"expected {RUN_FRAMES} figures in {RUN_SHEET}, found {len(boxes)}"
run_sources = []
for i, (x0, y0, x1, y1) in enumerate(boxes, 1):
    # keep the keyed figure at native resolution and record its own scale, so it is
    # resampled exactly once (like every other frame) and its edges stay crisp
    fig = rgba[y0:y1, x0:x1]
    hw = head_width(fig[..., 3] > 0)
    s = HEAD_REF / hw
    pad = np.zeros((fig.shape[0] + 8, fig.shape[1] + 8, 4), np.uint8)
    pad[4:-4, 4:-4] = fig
    run_sources.append((f"run-{i}", pad, s))
    REPORT["run_sheet"][f"run-{i}"] = {"raw_head_px": hw, "head_scale": round(s, 3)}
REPORT["run_sheet"]["head_ref_px"] = HEAD_REF

# Compromise scale: the sheet draws NURLAN with a shorter body, so matching heads alone
# made him look ~12% smaller while running. One shared factor (keeps the six frames
# consistent with each other) sets their AVERAGE height to RUN_HEIGHT_RATIO x idle height;
# runners look slightly shorter than when standing because of bent knees. Heads grow a little.
RUN_HEIGHT_RATIO = 0.935


def fig_height(rgba_arr):
    ys = np.nonzero(rgba_arr[..., 3] > 0)[0]
    return float(ys.max() - ys.min() + 1)


idle_h = fig_height(sources[0][1])
mean_run_h = float(np.mean([fig_height(r) * s for _, r, s in run_sources]))
shared = RUN_HEIGHT_RATIO * idle_h / mean_run_h
run_sources = [(n, r, s * shared) for n, r, s in run_sources]
for n, r, s in run_sources:
    REPORT["run_sheet"][n].update(final_scale=round(s, 3),
                                  height_vs_idle=round(fig_height(r) * s / idle_h, 3))
REPORT["run_sheet"]["shared_factor"] = round(shared, 3)
REPORT["run_sheet"]["avg_height_vs_idle"] = RUN_HEIGHT_RATIO
CHAR = [(n, r, 1.0) for n, r in sources[:1]] + run_sources + [(n, r, 1.0) for n, r in sources[1:]]
# order in the sheet: idle, run-1..6, jump, fall, kick

for name, rgba, fscale in CHAR:
    a = rgba[..., 3] > 0
    ys, xs = np.nonzero(a)
    top, bot = ys.min(), ys.max()
    # head width (rows 4%..10% of figure height), in reference px, to check one shared scale
    hrows = a[top + int(0.04 * (bot - top)): top + int(0.10 * (bot - top))]
    head_w[name] = int(round(np.median(hrows.sum(1)) * fscale))
    # torso centre: mean x of opaque pixels in the 28%..48% height band
    band = a[top + int(0.28 * (bot - top)): top + int(0.48 * (bot - top))]
    bys, bxs = np.nonzero(band)
    frames[name] = dict(img=to_img(rgba), cx=float(bxs.mean()), bottom=int(bot),
                        bbox=(xs.min(), top, xs.max() + 1, bot + 1), k=CHAR_SCALE * fscale)
REPORT["character_head_width_px"] = head_w

# common canvas: torso centre on the canvas centre line, feet on one baseline (output px)
half = 0
height = 0
for f in frames.values():
    x0, y0, x1, y1 = f["bbox"]
    half = max(half, (f["cx"] - x0) * f["k"], (x1 - f["cx"]) * f["k"])
    height = max(height, (y1 - y0) * f["k"])
FW = int(np.ceil(2 * half + 8 * CHAR_SCALE))
FH = int(np.ceil(height + 8 * CHAR_SCALE))
FW += FW % 2
sheet = Image.new("RGBA", (FW * len(CHAR), FH))
atlas = {"frames": {}, "meta": {"image": "character.webp", "format": "RGBA8888",
                                 "size": {"w": sheet.width, "h": sheet.height}, "scale": "1"}}
for i, (name, _, _) in enumerate(CHAR):
    f = frames[name]
    x0, y0, x1, y1 = f["bbox"]
    crop = f["img"].crop((x0, y0, x1, y1))
    w = max(1, round(crop.width * f["k"]))
    h = max(1, round(crop.height * f["k"]))
    crop = crop.resize((w, h), Image.LANCZOS)
    left = round(FW / 2 - (f["cx"] - x0) * f["k"])
    top = FH - 3 - h            # all feet on the same baseline, 3 px from the bottom
    if name in ("jump", "fall"):  # airborne frames: same baseline, lifted a touch
        top = FH - 3 - h
    cell = Image.new("RGBA", (FW, FH))
    cell.alpha_composite(crop, (left, top))
    sheet.alpha_composite(cell, (i * FW, 0))
    atlas["frames"][name] = {"frame": {"x": i * FW, "y": 0, "w": FW, "h": FH}, "rotated": False,
                             "trimmed": False, "spriteSourceSize": {"x": 0, "y": 0, "w": FW, "h": FH},
                             "sourceSize": {"w": FW, "h": FH}, "pivot": {"x": 0.5, "y": 1}}
save_webp(sheet, OUT / "character.webp", lossless=True)
(OUT / "character.json").write_text(json.dumps(atlas, indent=1))
REPORT["character_frame"] = [FW, FH]

# ---------------------------------------------------------------- props-1
PROP_NAMES = [  # reading order: row by row, left to right
    ["platform-grass-short", "platform-glass-short", "platform-tech-short"],
    ["platform-grass-long", "platform-glass-long", "platform-tech-long"],
    ["icon-cap", "icon-diploma", "icon-medal", "icon-book", "icon-robot", "icon-chip", "icon-star"],
    ["flag", "sign"],
]
rgba, key = key_out(load("props-1.webp"), min_speck=12)
keys_used["props-1.webp"] = key.round().tolist()
boxes, _ = components(rgba, merge=10)
boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
rows = []
for b in boxes:
    cy = (b[1] + b[3]) / 2
    if rows and abs(rows[-1][0] - cy) < 45:
        rows[-1][1].append(b)
    else:
        rows.append([cy, [b]])
props = {}
assert [len(r[1]) for r in rows] == [len(r) for r in PROP_NAMES], [len(r[1]) for r in rows]
for (cy, row), names in zip(rows, PROP_NAMES):
    row.sort(key=lambda b: b[0])
    for b, name in zip(row, names):
        im = trim(to_img(rgba).crop(b))
        if name.startswith("icon-"):
            im = im.resize((round(im.width * 0.75), round(im.height * 0.75)), Image.LANCZOS)
        save_webp(im, OUT / "props" / f"{name}.webp", lossless=True)
        props[name] = im
REPORT["props"] = {k: v.size for k, v in props.items()}

# ---------------------------------------------------------------- keeper
rgba, key = key_out(load("keeper.webp"), min_speck=40)
keys_used["keeper.webp"] = key.round().tolist()
boxes, _ = components(rgba, merge=8)
boxes.sort(key=lambda b: b[0])
# expected: stand (left), two dives (middle, one above the other), kneel (right)
stand, *mid, kneel = boxes
mid.sort(key=lambda b: b[1])
named = {"keeper-stand": stand, "keeper-dive-right": mid[0], "keeper-dive-left": mid[1],
         "keeper-kneel": kneel}
keepers = {}
for name, b in named.items():
    im = trim(to_img(rgba).crop(b))
    im = im.resize((round(im.width * 0.5), round(im.height * 0.5)), Image.LANCZOS)
    save_webp(im, OUT / "keeper" / f"{name}.webp", lossless=True)
    keepers[name] = im
REPORT["keeper"] = {k: v.size for k, v in keepers.items()}

# ---------------------------------------------------------------- layers
# Detect which file of each pair is the keyed (mid) layer; w1's names are swapped in raw-assets.
layers = {}
for w in (1, 2, 3, 4):
    pair = {}
    for kind in ("far", "mid"):
        a = load(f"w{w}-{kind}.webp")
        k, m = detect_key(a)
        pair[kind] = (a, k)
    if pair["far"][1] is not None and pair["mid"][1] is None:
        pair = {"far": pair["mid"], "mid": pair["far"]}
        REPORT.setdefault("swapped", []).append(f"w{w}: raw far/mid swapped (far had the green key)")
    far = pair["far"][0]
    mid_rgba, mkey = key_out(pair["mid"][0], min_speck=30)
    if w == 4:
        # The stadium's upper half (stands, roofs) has no natural green, but a stand fragment
        # carries dark key spill. Neutralise any green excess there; the pitch below is untouched.
        top = int(mid_rgba.shape[0] * 0.55)
        part = mid_rgba[:top].astype(np.int32)
        mx = np.maximum(part[..., 0], part[..., 2])
        part[..., 1] = np.minimum(part[..., 1], mx + 4)
        mid_rgba[:top] = part.astype(np.uint8)
    keys_used[f"w{w}-mid"] = mkey.round().tolist()
    # colour grading: pull the mid layer toward the far layer's light (mean colour + contrast),
    # add a touch of atmospheric haze to the far layer so far < mid < gameplay in contrast.
    far_mean = far.reshape(-1, 3).mean(0)
    mid_rgb = mid_rgba[..., :3].astype(np.float32)
    vis = mid_rgba[..., 3] > 0
    mid_mean = mid_rgb[vis].mean(0)
    graded = mid_rgb + 0.35 * (far_mean - mid_mean)            # shift white balance
    lum = graded.mean(-1, keepdims=True)
    graded = lum + 0.92 * (graded - lum)                       # slight desaturation
    graded = graded * 0.9 + far_mean * 0.1                     # atmospheric blend
    mid_rgba[..., :3] = np.where(vis[..., None], graded.clip(0, 255), 0).astype(np.uint8)
    far_g = far * 0.82 + far_mean * 0.18                       # haze
    far_img = Image.fromarray(far_g.clip(0, 255).astype(np.uint8), "RGB")
    mid_img = to_img(mid_rgba)
    save_webp(far_img, OUT / "layers" / f"w{w}-far.webp", q=86)
    save_webp(mid_img, OUT / "layers" / f"w{w}-mid.webp", q=88)
    layers[f"w{w}-far"] = far_img
    layers[f"w{w}-mid"] = mid_img

pen = Image.open(RAW / "penalty-scene.webp").convert("RGB")
save_webp(pen, OUT / "layers" / "penalty-scene.webp", q=88)
layers["penalty-scene"] = pen

# Side extensions for screens wider than the penalty image (it is never tiled or mirrored).
# Each is the image's own outer 20 px, flipped so its inner edge matches the image edge,
# stretched outward, blurred, and darkened toward the outside.
EXT_W = 256
for side in ("l", "r"):
    strip = pen.crop((0, 0, 20, pen.height)) if side == "l" else pen.crop((pen.width - 20, 0, pen.width, pen.height))
    strip = strip.transpose(Image.FLIP_LEFT_RIGHT)
    ext = strip.resize((EXT_W, pen.height), Image.BICUBIC).filter(ImageFilter.GaussianBlur(6))
    a = np.asarray(ext).astype(np.float32)
    ramp = np.linspace(0.45, 1.0, EXT_W, dtype=np.float32)        # dark outside -> full at the seam
    if side == "r":
        ramp = ramp[::-1]
    a *= ramp[None, :, None]
    ext = Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGB")
    save_webp(ext, OUT / "layers" / f"penalty-ext-{side}.webp", q=85)
    layers[f"penalty-ext-{side}"] = ext

# ---------------------------------------------------------------- props-2
# Uses ONLY the three ball rotation frames and the corner flag from the top row.
# The side-view goal and the grey goalkeeper on this sheet are deliberately ignored.
rgba, key = key_out(load("props-2.webp"), min_speck=40)
keys_used["props-2.webp"] = key.round().tolist()
H2 = rgba.shape[0]
boxes, _ = components(rgba, merge=6)
top_row = sorted([b for b in boxes if (b[1] + b[3]) / 2 < H2 * 0.5], key=lambda b: b[0])
assert len(top_row) == 5, f"expected ball, ball, ball, goal, flag in the top row; got {len(top_row)}"
ball_boxes, flag_box = top_row[:3], top_row[4]
BALL = 64                                   # all three frames on one square canvas, same scale
diam = max(max(b[2] - b[0], b[3] - b[1]) for b in ball_boxes)
balls = {}
for i, b in enumerate(ball_boxes, 1):
    im = trim(to_img(rgba).crop(b), pad=0)
    s = (BALL - 2) / diam
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    cell = Image.new("RGBA", (BALL, BALL))
    cell.alpha_composite(im, ((BALL - im.width) // 2, (BALL - im.height) // 2))
    save_webp(cell, OUT / "fx" / f"ball-{i}.webp", lossless=True)
    balls[f"ball-{i}"] = cell
flag = trim(to_img(rgba).crop(flag_box))
flag = flag.resize((round(flag.width * 0.6), round(flag.height * 0.6)), Image.LANCZOS)
save_webp(flag, OUT / "props" / "corner-flag.webp", lossless=True)
REPORT["props-2"] = {**{k: v.size for k, v in balls.items()}, "corner-flag": flag.size}

# ---------------------------------------------------------------- contact sheet
def checker(w, h, s=12):
    yy, xx = np.mgrid[0:h, 0:w]
    c = (((yy // s) + (xx // s)) % 2).astype(np.uint8)
    base = np.where(c[..., None] == 1, np.array([205, 205, 210], np.uint8),
                    np.array([245, 245, 248], np.uint8))
    return Image.fromarray(base, "RGB").convert("RGBA")


def sheet_of(items, cols, cell, title):
    rows_n = (len(items) + cols - 1) // cols
    cw, ch = cell
    W = cols * cw
    H = rows_n * (ch + 18) + 30
    out = Image.new("RGBA", (W, H), (30, 30, 36, 255))
    dr = ImageDraw.Draw(out)
    dr.text((8, 8), title, fill=(255, 255, 255, 255))
    for i, (name, im) in enumerate(items):
        x = (i % cols) * cw
        y = 30 + (i // cols) * (ch + 18)
        bg = checker(cw - 6, ch - 6)
        im2 = im.convert("RGBA")
        sc = min((cw - 10) / im2.width, (ch - 10) / im2.height, 1.0)
        im2 = im2.resize((max(1, int(im2.width * sc)), max(1, int(im2.height * sc))), Image.LANCZOS)
        bg.alpha_composite(im2, ((bg.width - im2.width) // 2, (bg.height - im2.height) // 2))
        out.alpha_composite(bg, (x + 3, y))
        dr.text((x + 6, y + ch - 4), f"{name} {im.width}x{im.height}", fill=(230, 230, 230, 255))
    return out


char_items = [(n, sheet.crop((i * FW, 0, (i + 1) * FW, FH))) for i, (n, _, _) in enumerate(CHAR)]
parts = [
    sheet_of(char_items, 8, (FW + 16, FH + 16), "Character frames (shared canvas, feet baseline, torso centred)"),
    sheet_of(list(props.items()), 6, (240, 150), "Props (from props-1)"),
    sheet_of(list(keepers.items()), 4, (260, 240), "Keeper (from keeper.webp)"),
    sheet_of(list(balls.items()) + [("corner-flag", flag)], 4, (200, 200), "From props-2: ball frames + corner flag"),
    sheet_of([(k, v) for k, v in layers.items() if k.endswith("mid")], 2, (620, 300), "Mid layers (keyed, graded)"),
    sheet_of([(k, v) for k, v in layers.items() if not k.endswith("mid")], 3, (420, 250), "Far layers + penalty scene (opaque)"),
]
W = max(p.width for p in parts)
H = sum(p.height for p in parts) + 10 * len(parts)
cs = Image.new("RGBA", (W, H), (30, 30, 36, 255))
y = 0
for p in parts:
    cs.alpha_composite(p, (0, y))
    y += p.height + 10
cs.convert("RGB").save(QA / "contact-sheet.png", optimize=True)

# zoomed edge-check crops (2x, nearest) on checkerboard
zoom = []
for name, im, box in [("idle head", frames["idle"]["img"], (420, 90, 640, 300)),
                      ("run-2 feet", frames["run-2"]["img"],
                       (frames["run-2"]["bbox"][0], frames["run-2"]["bbox"][3] - 160,
                        frames["run-2"]["bbox"][0] + 220, frames["run-2"]["bbox"][3])),
                      ("w2-mid trees", layers["w2-mid"], (0, 150, 220, 300)),
                      ("w3-mid cables", layers["w3-mid"], (500, 0, 720, 150)),
                      ("w4-mid stands", layers["w4-mid"], (780, 0, 1000, 150)),
                      ("book glow", props["icon-book"], (0, 0, props["icon-book"].width, props["icon-book"].height)),
                      ("ball-1", balls["ball-1"], (0, 0, BALL, BALL)),
                      ("ball-3", balls["ball-3"], (0, 0, BALL, BALL)),
                      ("corner flag", flag, (0, 0, flag.width, min(flag.height, 150)))]:
    c = im.crop(box).convert("RGBA")
    c = c.resize((c.width * 2, c.height * 2), Image.NEAREST)
    zoom.append((name, c))
sheet_of(zoom, 3, (460, 340), "Edge check (2x nearest)").convert("RGB").save(QA / "edge-check.png", optimize=True)

REPORT["keys_detected"] = keys_used
(QA / "asset-report.json").write_text(json.dumps(REPORT, indent=1, default=str))
print(json.dumps(REPORT, indent=1, default=str))
