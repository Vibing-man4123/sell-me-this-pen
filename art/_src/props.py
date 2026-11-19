from svgkit import *
import random

OUT = "/home/claude/art/out"


def coil(points, loops, amp, sw=5, color=INK):
    """Coiled phone cord along a polyline of points."""
    # resample polyline
    seg = []
    total = 0
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        L = math.hypot(x1 - x0, y1 - y0); seg.append((x0, y0, x1, y1, L)); total += L
    n = loops * 8
    d = ""
    for i in range(n + 1):
        t = i / n * total
        for x0, y0, x1, y1, L in seg:
            if t <= L or (x0, y0, x1, y1, L) == seg[-1]:
                u = min(t / L, 1) if L else 0
                x, y = x0 + (x1 - x0) * u, y0 + (y1 - y0) * u
                nx, ny = -(y1 - y0) / L, (x1 - x0) / L
                break
            t -= L
        ph = i / 8 * 2 * math.pi
        x += nx * math.sin(ph) * amp + (x1 - x0) / L * math.cos(ph) * amp * 0.6
        y += ny * math.sin(ph) * amp + (y1 - y0) / L * math.cos(ph) * amp * 0.6
        d += ("M" if i == 0 else "L") + f"{x:.1f},{y:.1f} "
    return path(d, "none", sw, extra=f'stroke="{color}"')


def handset(cx, cy, ang=0, s=1.0, sw=5):
    """A chunky 80s handset, horizontal by default (earpiece left)."""
    b = ""
    b += path("M-120,-6 Q-40,-36 40,-36 Q100,-36 120,-6 L104,14 Q60,-6 0,-6 Q-60,-6 -104,14 Z", C["sand"], sw)
    b += ell(-128, 16, 52, 30, C["sand_dim"], sw) + ell(-128, 6, 40, 18, C["sand"], sw * 0.8)
    b += ell(128, 16, 52, 30, C["sand_dim"], sw) + ell(128, 6, 40, 18, C["sand"], sw * 0.8)
    for k in (-14, 0, 14):
        b += circ(-128 + k, 6, 3, C["ink"], 0) + circ(128 + k, 6, 3, C["ink"], 0)
    b += path("M-80,-22 Q0,-34 80,-22", "none", sw * 0.7, extra=f'stroke="{C["shell"]}"')
    b += rect(-36, -30, 72, 10, C["brass"], sw * 0.6, rx=4)
    return g(b, f'transform="translate({cx} {cy}) rotate({ang}) scale({s})"')


def phone_body(sw=5):
    b = ""
    b += ell(300, 440, 250, 30, C["ink"], 0, extra='opacity="0.12"')
    # front face
    b += poly([(110, 320), (490, 320), (524, 430), (76, 430)], C["sand_dim"], sw)
    b += poly([(150, 360), (450, 360), (462, 398), (138, 398)], C["brass"], sw * 0.8)
    for k in range(9):
        b += line(176 + k * 30, 370, 172 + k * 30, 388, 4, C["wood_dark"])
    # top face
    b += poly([(160, 160), (440, 160), (490, 320), (110, 320)], C["sand"], sw)
    # cradle forks
    b += path("M170,170 L200,120 L250,120 L262,170 Z", C["brass"], sw)
    b += path("M338,170 L350,120 L400,120 L430,170 Z", C["brass"], sw)
    b += rect(268, 150, 64, 20, C["beige_shadow"], sw * 0.8, rx=6)  # hook switch
    # keypad (perspective grid)
    for r in range(4):
        for c in range(3):
            y = 198 + r * 28
            shrink = 1 - (3 - r) * 0.04
            x = 300 + (c - 1) * 54 * (0.86 + r * 0.05)
            b += path(f"M{x-20*shrink},{y} L{x+20*shrink},{y} L{x+23*shrink},{y+20} L{x-23*shrink},{y+20} Z",
                      C["shell"], sw * 0.7)
    # multi-line buttons (one lit)
    for k in range(4):
        x = 400 + k * 6
        y = 196 + k * 28
        fill = C["dialtone"] if k == 0 else C["sky_pale"]
        b += rect(x + 8, y, 30, 20, fill, sw * 0.7, rx=4)
    b += rect(150, 196, 34, 100, C["shell"], sw * 0.7, rx=4)  # paper label strip
    for k in range(4):
        b += line(158, 214 + k * 22, 176, 214 + k * 22, 3, C["ink_faint"])
    return b


def phone(state):
    W, H = 600, 500
    b = ""
    if state == "live":
        b += phone_body()
        b += coil([(112, 340), (80, 372), (58, 404)], 7, 10)
        b += handset(40, 300, -78, 0.8)
        b += path("M200,150 Q300,120 400,150", "none", 5, extra='stroke-dasharray="10 12"')
    else:
        lift = 0 if state == "idle" else -26
        rot = 0 if state == "idle" else -5
        b += coil([(112, 340), (40, 330), (40, 200), (150, 120 + lift + 30)], 12, 11)
        b += phone_body()
        b += handset(300, 112 + lift, rot, 1.0)
        if state == "ringing":
            for side in (-1, 1):
                for k, r in enumerate((40, 70)):
                    cx = 300 + side * 235
                    b += path(f"M{cx-side*10},{90-r*0.7} Q{cx+side*r*0.6},{100} {cx-side*10},{110+r*0.7}", "none", 6)
            for x, y, a in ((150, 40, -25), (450, 40, 25), (300, 20, 0)):
                b += line(x, y, x + math.sin(math.radians(a)) * 30, y - math.cos(math.radians(a)) * 30, 6)
            for x in (160, 210, 390, 440):
                b += line(x, 450, x + (8 if x > 300 else -8), 474, 5)
    title = {"idle": "Desk phone - idle", "ringing": "Desk phone - ringing", "live": "Desk phone - live (handset off the hook)"}[state]
    return svg(W, H, b, title)


def phone_handset_icon():
    return svg(400, 400, coil([(300, 290), (340, 340), (370, 380)], 4, 9) + handset(200, 200, -38, 1.05), "Phone handset")


# ---------------- UI ----------------

def button(x, y, w, h, fill, shadow, label, state, lab_col=INK):
    off = {"rest": 8, "hover": 10, "pressed": 2}[state]
    dy = {"rest": 0, "hover": -2, "pressed": 6}[state]
    f = fill
    if state == "hover":
        f = {C["gold"]: C["gold_light"], C["shell"]: C["sky_pale"], C["coral"]: C["coral_light"]}[fill]
    b = rect(x, y + 8, w, h, shadow, 5, rx=14)
    b += rect(x, y + dy, w, h, f, 5, rx=14)
    if state != "pressed":
        b += path(f"M{x+12},{y+dy+16} Q{x+12},{y+dy+8} {x+24},{y+dy+8} L{x+w-24},{y+dy+8} Q{x+w-12},{y+dy+8} {x+w-12},{y+dy+16} "
                  f"L{x+w-12},{y+dy+h*0.42} L{x+12},{y+dy+h*0.42} Z", C["shell"], 0, extra='opacity="0.5"')
    b += text(x + w / 2, y + dy + h / 2 + 8, label, 22, lab_col, family="Arial Black, Impact, sans-serif", weight=900,
              extra='letter-spacing="2"')
    return b


def ui_buttons():
    b = ""
    for i, s in enumerate(("rest", "hover", "pressed")):
        b += button(16 + i * 196, 14, 176, 62, C["gold"], C["brass"], "SAY IT", s)
        b += button(16 + i * 196, 112, 176, 62, C["shell"], C["sky_deep"], "HANG UP", s)
    return svg(600, 200, b, "Buttons - gold primary and white secondary, rest / hover / pressed")


def wobble_bubble(x, y, w, h, tail, seed):
    random.seed(seed)
    pts = []
    r = 26
    n = 10
    def j(): return random.uniform(-3.5, 3.5)
    # build path around the box with jitter, tail inserted on bottom edge
    d = f"M{x+r},{y+j()} "
    for k in range(1, n):
        d += f"L{x+r+(w-2*r)*k/n:.1f},{y+j():.1f} "
    d += f"Q{x+w},{y} {x+w+j():.1f},{y+r} "
    for k in range(1, n // 2):
        d += f"L{x+w+j():.1f},{y+r+(h-2*r)*k/(n//2):.1f} "
    d += f"Q{x+w},{y+h} {x+w-r},{y+h+j():.1f} "
    if tail == "right":
        d += f"L{x+w-40},{y+h} L{x+w+20},{y+h+58} L{x+w-100},{y+h} "
    for k in range(n - 1, 0, -1):
        xx = x + r + (w - 2 * r) * k / n
        if tail == "left" and abs(xx - (x + 90)) < 30:
            continue
        if tail == "right" and xx > x + w - 120:
            continue
        if tail == "left" and xx < x + 130 and xx > x + 60:
            continue
        d += f"L{xx:.1f},{y+h+j():.1f} "
    if tail == "left":
        d += f"L{x+120},{y+h} L{x-20},{y+h+58} L{x+50},{y+h} "
    d += f"L{x+r},{y+h} Q{x},{y+h} {x+j():.1f},{y+h-r} "
    for k in range(n // 2 - 1, 0, -1):
        d += f"L{x+j():.1f},{y+r+(h-2*r)*k/(n//2):.1f} "
    d += f"Q{x},{y} {x+r},{y} Z"
    return d


def ui_bubbles():
    b = path(wobble_bubble(30, 30, 340, 250, "left", 3), C["sky_pale"], 6)
    b += path(wobble_bubble(430, 30, 340, 250, "right", 7), C["sand"], 6)
    b += text(200, 300 + 70, "client", 18, C["ink_faint"], family="monospace", weight=400)
    b += text(600, 300 + 70, "broker", 18, C["ink_faint"], family="monospace", weight=400)
    return svg(800, 400, b, "Speech bubbles - client (sky-pale) and broker (sand)")


def bubble_single(kind):
    if kind == "client":
        return svg(400, 340, path(wobble_bubble(30, 20, 340, 250, "left", 3), C["sky_pale"], 6), "Client bubble")
    return svg(400, 340, path(wobble_bubble(30, 20, 340, 250, "right", 7), C["sand"], 6), "Broker bubble")


def ui_frame():
    W, H = 900, 600
    b = rect(14, 14, W - 28, H - 28, "none", 6)
    b += rect(30, 30, W - 60, H - 60, "none", 4, extra=f'stroke="{C["brass"]}"')
    b += rect(40, 40, W - 80, H - 80, "none", 2.5, extra=f'stroke="{C["brass"]}"')
    def corner(tx, ty, sx, sy):
        c = ""
        c += path("M0,0 L96,0 L96,22 L22,22 L22,96 L0,96 Z", C["brass"], 5)
        c += path("M22,22 L70,22 A48,48 0 0 1 22,70 Z", C["gold_light"], 4)
        c += path("M22,22 L52,22 A30,30 0 0 1 22,52 Z", C["gold"], 3.5)
        c += circ(80, 11, 5, C["gold_light"], 3) + circ(11, 80, 5, C["gold_light"], 3)
        return g(c, f'transform="translate({tx} {ty}) scale({sx} {sy})"')
    b += corner(6, 6, 1, 1) + corner(W - 6, 6, -1, 1) + corner(6, H - 6, 1, -1) + corner(W - 6, H - 6, -1, -1)
    # edge medallions (centre of each edge, optional when 9-slicing)
    for (cx, cy) in ((W / 2, 22), (W / 2, H - 22)):
        b += path(f"M{cx-40},{cy} L{cx},{cy-14} L{cx+40},{cy} L{cx},{cy+14} Z", C["gold_light"], 4)
    return svg(W, H, b, "Brass deco frame (9-slice: corners 110px)")


def stamp(word, color, w=400, h=300, rot=-15, seed=1, size=110):
    random.seed(seed)
    mask = f'<mask id="m{seed}"><rect width="{w}" height="{h}" fill="#fff"/>'
    for _ in range(26):
        x, y = random.uniform(30, w - 30), random.uniform(40, h - 40)
        mask += f'<rect x="{x:.0f}" y="{y:.0f}" width="{random.uniform(6,30):.0f}" height="{random.uniform(2,6):.0f}" fill="#000" transform="rotate({random.uniform(-20,20):.0f} {x:.0f} {y:.0f})"/>'
    for _ in range(14):
        mask += f'<circle cx="{random.uniform(20,w-20):.0f}" cy="{random.uniform(20,h-20):.0f}" r="{random.uniform(2,5):.1f}" fill="#000"/>'
    mask += "</mask>"
    body = rect(30, 60, w - 60, h - 120, "none", 12, rx=18, extra=f'stroke="{color}"')
    body += rect(46, 76, w - 92, h - 152, "none", 4, rx=10, extra=f'stroke="{color}"')
    body += text(w / 2, h / 2 + size * 0.36, word, size, color, family="Impact, 'Arial Black', sans-serif", weight=900,
                 extra='letter-spacing="4"')
    # ink bleed blobs
    for _ in range(6):
        body += circ(random.uniform(40, w - 40), random.choice((random.uniform(52, 66), random.uniform(h - 66, h - 52))),
                     random.uniform(3, 6), color, 0)
    return svg(w, h, mask + g(g(body, f'transform="rotate({rot} {w/2} {h/2})"'), f'mask="url(#m{seed})"'), f"Stamp - {word}")


def fx_cash_burst():
    random.seed(4)
    W = 400
    cx = cy = 200
    pts = []
    for k in range(24):
        a = math.radians(k * 15); r = 150 if k % 2 == 0 else 96
        pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    b = poly(pts, C["gold_light"], 5)
    for k in range(7):
        a = k * 360 / 7 + 10
        r = 120
        x, y = cx + math.cos(math.radians(a)) * r, cy + math.sin(math.radians(a)) * r
        bill = rect(-46, -24, 92, 48, C["lime"], 4.5, rx=4) + rect(-36, -15, 72, 30, "none", 2.5) + circ(0, 0, 12, "#c8ec98", 3)
        bill += text(0, 7, "$", 20, C["palm"], family="Georgia, serif")
        b += g(bill, f'transform="translate({x:.0f} {y:.0f}) rotate({a+90+random.uniform(-25,25):.0f})"')
    for k in range(6):
        a = k * 60 + 40
        r = 70 + (k % 2) * 90
        x, y = cx + math.cos(math.radians(a)) * r, cy + math.sin(math.radians(a)) * r
        b += ell(x, y, 22, 18, C["gold"], 4.5) + ell(x - 3, y - 3, 12, 9, C["gold_light"], 0) + text(x, y + 7, "$", 18, C["brass"])
    b += text(cx, cy + 26, "$", 90, C["gold"], family="Georgia, serif", extra=f'stroke="{INK}" stroke-width="5" paint-order="stroke"')
    return svg(W, W, b, "Cash burst")


def droplet(x, y, s, rot=0):
    d = "M0,-50 Q30,-10 30,14 A30,30 0 0 1 -30,14 Q-30,-10 0,-50 Z"
    b = path(d, C["hot_cyan"], 5) + path("M-12,4 Q-14,-10 -4,-22", "none", 5, extra=f'stroke="{C["shell"]}"')
    return g(b, f'transform="translate({x} {y}) rotate({rot}) scale({s})"')


def fx_sweat():
    return svg(200, 200, droplet(60, 80, 0.9, -15) + droplet(130, 60, 0.7, 10) + droplet(120, 150, 0.6, 5), "Sweat drops")


def fx_dialtone():
    b = circ(30, 50, 12, C["dialtone"], 4)
    for k in range(4):
        r = 34 + k * 26
        b += path(f"M{30+r*0.8},{50-r*0.6} A{r},{r} 0 0 1 {30+r*0.8},{50+r*0.6}", "none", 7, extra=f'stroke="{C["dialtone"]}" opacity="{1-k*0.2:.1f}"')
    b += g("".join(rect(170 + i * 22, 50 - hh / 2, 12, hh, C["dialtone"], 0, rx=6) for i, hh in enumerate((20, 48, 70, 34, 56, 24, 62, 30, 44, 18))))
    return svg(400, 100, b, "Dial tone / live call waves")


def fx_ring_lines():
    b = ""
    for side in (-1, 1):
        for k, r in enumerate((60, 100, 140)):
            cx = 200
            b += path(f"M{cx+side*r*0.7},{100-r*0.6} A{r},{r} 0 0 {1 if side>0 else 0} {cx+side*r*0.7},{100+r*0.6}", "none", 8 - k)
    b += text(200, 118, "RRING!", 46, C["coral"], family="Impact, 'Arial Black', sans-serif",
              extra=f'stroke="{INK}" stroke-width="5" paint-order="stroke" transform="rotate(-6 200 100)"')
    return svg(400, 200, b, "Ringing shake lines")


# ---------------- logo ----------------

def pen(x, y, L, ang, body=C["gold"], cap=C["shell"], sw=6):
    b = path(f"M{L/2},-14 L{L/2+46},0 L{L/2},14 Z", C["sand"], sw)
    b += line(L / 2 + 36, 0, L / 2 + 46, 0, 6)
    b += rect(-L / 2, -16, L, 32, body, sw, rx=14)
    b += rect(-L / 2 + 12, -10, L - 24, 7, C["gold_light"] if body == C["gold"] else C["shell"], 0, rx=3)
    b += rect(-L / 2 - 20, -18, 110, 36, cap, sw, rx=14)
    b += path(f"M{-L/2+10},-18 L{-L/2+10},-34 L{-L/2+90},-34 L{-L/2+90},-18", C["gold_light"], sw * 0.8)
    b += rect(L / 2 - 30, -17, 18, 34, C["brass"], sw * 0.7)
    return g(b, f'transform="translate({x} {y}) rotate({ang})"')


def logo():
    W, H = 1200, 600
    defs = (f'<defs><linearGradient id="foil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{C["gold_light"]}"/>'
            f'<stop offset="1" stop-color="{C["gold"]}"/></linearGradient>'
            '<path id="arc1" d="M150,270 Q600,150 1050,270"/><path id="arc2" d="M130,470 Q600,350 1070,470"/></defs>')
    fam = "Anton, Impact, 'Arial Narrow Bold', 'Arial Black', sans-serif"
    def word(arc, s, size):
        common = f'font-family="{fam}" font-size="{size}" text-anchor="middle" letter-spacing="6"'
        tp = f'<textPath href="#{arc}" startOffset="50%">{s}</textPath>'
        out = f'<text {common} fill="{C["hot_pink"]}" stroke="{INK}" stroke-width="14" transform="translate(14 14)">{tp}</text>'
        out += f'<text {common} fill="url(#foil)" stroke="{INK}" stroke-width="14" paint-order="stroke">{tp}</text>'
        out += f'<text {common} fill="none" stroke="{C["shell"]}" stroke-width="4" opacity="0.85" transform="translate(-4 -6)" clip-path="url(#upper)">{tp}</text>'
        return out
    clip = '<clipPath id="upper"><rect x="0" y="120" width="1200" height="60"/><rect x="0" y="320" width="1200" height="60"/></clipPath>'
    b = defs + clip
    b += pen(600, 300, 760, -24)
    b += word("arc1", "SELL ME", 190) + word("arc2", "THIS PEN", 190)
    # sparkle
    for (x, y, s) in ((1060, 120, 1), (150, 500, 0.7)):
        b += path(f"M{x},{y-40*s} L{x+9*s},{y-9*s} L{x+40*s},{y} L{x+9*s},{y+9*s} L{x},{y+40*s} L{x-9*s},{y+9*s} L{x-40*s},{y} L{x-9*s},{y-9*s} Z", C["shell"], 5)
    return svg(W, H, b, "Sell Me This Pen - wordmark")


def favicon():
    b = circ(256, 256, 236, C["sky"], 14) + circ(256, 256, 190, "none", 6, extra=f'stroke="{C["shell"]}"')
    b += pen(256, 256, 300, -40, sw=12)
    return svg(512, 512, b, "Sell Me This Pen - app icon")


if __name__ == "__main__":
    for s in ("idle", "ringing", "live"):
        write(OUT + "/props", f"phone_{s}.svg", phone(s))
    write(OUT + "/props", "phone_handset.svg", phone_handset_icon())
    write(OUT + "/ui", "ui-button-set.svg", ui_buttons())
    write(OUT + "/ui", "ui-bubble-set.svg", ui_bubbles())
    write(OUT + "/ui", "ui-bubble-client.svg", bubble_single("client"))
    write(OUT + "/ui", "ui-bubble-broker.svg", bubble_single("broker"))
    write(OUT + "/ui", "ui-frame.svg", ui_frame())
    write(OUT + "/fx", "fx-sold-stamp.svg", stamp("SOLD!", C["coral"], seed=1, size=92))
    write(OUT + "/fx", "fx-hungup-stamp.svg", stamp("HUNG UP", C["ink"], 460, 300, 10, 2, 70))
    write(OUT + "/fx", "fx-cash-burst.svg", fx_cash_burst())
    write(OUT + "/fx", "fx-sweat.svg", fx_sweat())
    write(OUT + "/fx", "fx-dialtone.svg", fx_dialtone())
    write(OUT + "/fx", "fx-ring.svg", fx_ring_lines())
    write(OUT + "/logo", "logo-wordmark.svg", logo())
    write(OUT + "/logo", "logo-icon.svg", favicon())
    print("ok")
