"""Tiny SVG helpers + the Sell Me This Pen palette (Miami Daylight + warm extension)."""
import math, os

C = dict(
    ink="#22364a", ink_soft="#4b6375", ink_faint="#5f7384",
    sky="#bfe3f2", sky_pale="#e3f3fb", sky_deep="#3a9bc9", shell="#ffffff",
    sand="#fdf4e6", sand_dim="#f1e2c9",
    brass="#98662b", gold="#f0922f", gold_light="#ffc061",
    coral="#d91d40", coral_light="#ff7d93", palm="#297d64", dialtone="#117d68",
    skin_light="#f6c9a0", skin_mid="#d79a6a", skin_deep="#8d5524",
    hot_pink="#ff5f9e", hot_cyan="#2ec5d9", hot_yellow="#ffd23f", hot_purple="#8f5bc4", lime="#9ed64f",
    # warm extension (golden hour) - shaded from existing hues
    cream="#fff9ef", peach="#ffd6b0", blush="#ffc9d6", wood="#a86f34", wood_dark="#7d5323",
    leather="#6b3a22", felt_dark="#20664f", beige_plastic="#ecdcbf", beige_shadow="#d3bf9a",
    sea="#58b4d8", glass="#d6eef7",
)
INK = C["ink"]


def svg(w, h, body, title="", bg=None):
    t = f"<title>{title}</title>" if title else ""
    b = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'stroke-linejoin="round" stroke-linecap="round">{t}{b}{body}</svg>')


def st(fill="none", sw=5, stroke=INK, extra=""):
    s = f'fill="{fill}"'
    if sw and 'stroke="' in extra:
        s += f' stroke-width="{sw}"'
    elif sw:
        s += f' stroke="{stroke}" stroke-width="{sw}"'
    return s + (" " + extra if extra else "")


def rect(x, y, w, h, fill, sw=5, rx=0, extra=""):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" {st(fill, sw, extra=extra)}/>'


def circ(cx, cy, r, fill, sw=5, extra=""):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" {st(fill, sw, extra=extra)}/>'


def ell(cx, cy, rx, ry, fill, sw=5, extra=""):
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" {st(fill, sw, extra=extra)}/>'


def path(d, fill="none", sw=5, extra="", stroke=INK):
    return f'<path d="{d}" {st(fill, sw, stroke, extra)}/>'


def poly(pts, fill, sw=5, extra=""):
    p = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    return f'<polygon points="{p}" {st(fill, sw, extra=extra)}/>'


def line(x1, y1, x2, y2, sw=5, stroke=INK, extra=""):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'


def g(body, extra=""):
    return f"<g {extra}>{body}</g>"


def text(x, y, s, size, fill=INK, family="Georgia, serif", weight=700, anchor="middle", extra=""):
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}" {extra}>{s}</text>')


def palm_tree(x, y, h, lean=1, sw=4, frond=C["palm"], trunk=C["wood"]):
    """Cartoon palm: curved trunk from (x,y) up h px, fronds at the top."""
    tx, ty = x + lean * h * 0.28, y - h
    d = f"M{x-9},{y} Q{x+lean*h*0.05},{y-h*0.55} {tx-6},{ty} L{tx+6},{ty} Q{x+lean*h*0.12},{y-h*0.5} {x+9},{y} Z"
    out = path(d, trunk, sw)
    # trunk rings
    for i in range(1, 7):
        t = i / 7
        px = x + (tx - x) * t ** 1.4
        py = y - h * t
        out += line(px - 8, py, px + 8, py + 3, sw * 0.6)
    fr = ""
    for ang in (-160, -125, -90, -55, -20, 15, 200):
        a = math.radians(ang)
        L = h * 0.42
        ex, ey = tx + math.cos(a) * L, ty + math.sin(a) * L * 0.55 + L * 0.25
        mx, my = tx + math.cos(a) * L * 0.5, ty + math.sin(a) * L * 0.5 - 18
        k = L * 0.2
        nx, ny = -math.sin(a) * k, math.cos(a) * k
        side = 1 if math.cos(a) >= 0 else -1
        fr += path(f"M{tx},{ty} Q{mx-nx*side},{my-ny*side-14} {ex},{ey} Q{mx+nx*side*0.3},{my+ny*side*0.3+8} {tx},{ty} Z", frond, sw)
    out += fr + circ(tx, ty + 4, 9, C["wood_dark"], sw * 0.8)
    return out


def write(dirname, name, content):
    os.makedirs(dirname, exist_ok=True)
    p = os.path.join(dirname, name)
    with open(p, "w") as f:
        f.write(content)
    return p


def rrect_d(x, y, w, h, r):
    return (f"M{x+r},{y} H{x+w-r} Q{x+w},{y} {x+w},{y+r} V{y+h-r} Q{x+w},{y+h} {x+w-r},{y+h} "
            f"H{x+r} Q{x},{y+h} {x},{y+h-r} V{y+r} Q{x},{y} {x+r},{y} Z")


def holed(outer, hole, fill, sw=5):
    """Rounded rect with a rounded-rect hole: outer/hole = (x,y,w,h,r)."""
    return f'<path d="{rrect_d(*outer)} {rrect_d(*hole)}" fill-rule="evenodd" {st(fill, sw)}/>'
