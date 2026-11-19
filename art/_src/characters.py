"""Character sketches: 512x512 head & shoulders, 3 expressions each.
Parts are grouped with ids (body, head, hair, face, props, fx) so they can be redrawn one by one."""
from svgkit import *

OUT = "/home/claude/art/out/characters"
SW = 7
EL, ER, EY = 205, 307, 222  # eye centres


def shade(hexc, f=0.85):
    h = hexc.lstrip("#")
    r, g_, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02x%02x%02x" % (int(r * f), int(g_ * f), int(b * f))


HAIR_GREY = "#d3d9de"
OLIVE = "#6f7d3c"
AVOCADO = "#8fae45"

# ---------------------------------------------------------------- face parts

def eye(cx, kind, skin, look=(0, 0), big=1.0):
    rx, ry = 27 * big, 31 * big
    lx, ly = look
    if kind == "happy":
        return path(f"M{cx-24},{EY+8} Q{cx},{EY-26} {cx+24},{EY+8}", "none", SW + 1)
    if kind == "closed":
        return path(f"M{cx-24},{EY-2} Q{cx},{EY+20} {cx+24},{EY-2}", "none", SW + 1)
    if kind == "squint":
        return (path(f"M{cx-26},{EY} Q{cx},{EY-10} {cx+26},{EY}", "none", SW + 1)
                + path(f"M{cx-18},{EY+8} Q{cx},{EY+12} {cx+18},{EY+8}", "none", SW - 2))
    b = ell(cx, EY, rx, ry, C["shell"], 0)
    if kind == "wide":
        b = ell(cx, EY, rx * 1.15, ry * 1.2, C["shell"], 0)
        b += circ(cx + lx, EY + ly, 6, INK, 0)
        b += ell(cx, EY, rx * 1.15, ry * 1.2, "none", SW)
        return b
    if kind == "dollar":
        b += path(f"M{cx+12},{EY-12} Q{cx},{EY-22} {cx-10},{EY-10} Q{cx-14},{EY} {cx},{EY+2} Q{cx+14},{EY+4} {cx+10},{EY+14} "
                  f"Q{cx},{EY+24} {cx-12},{EY+12}", "none", 7, extra=f'stroke="{C["palm"]}"')
        b += line(cx, EY - 26, cx, EY + 26, 5, C["palm"])
        b = ell(cx, EY, rx, ry, C["lime"], 0) + b[b.index("<path"):]
        b += ell(cx, EY, rx, ry, "none", SW)
        return b
    b += circ(cx + lx, EY + 4 + ly, 12 * big, INK, 0) + circ(cx + lx - 4, EY - 1 + ly, 4 * big, C["shell"], 0)
    if kind == "ring":  # ring-light reflection
        b += circ(cx + lx, EY + 4 + ly, 7 * big, "none", 2.5, extra=f'stroke="{C["shell"]}"')
    if kind in ("half", "shrewd"):
        top = EY - ry - 4
        cut = EY - 6 if kind == "half" else EY + 2
        b += path(f"M{cx-rx-3},{top} L{cx+rx+3},{top} L{cx+rx+3},{cut} Q{cx},{cut-8} {cx-rx-3},{cut} Z", skin, 0)
        b += f'<clipPath id="c{cx}{kind}"><ellipse cx="{cx}" cy="{EY}" rx="{rx}" ry="{ry}"/></clipPath>'
        b = f'<g>{b}</g>'
        b += path(f"M{cx-rx},{cut} Q{cx},{cut-8} {cx+rx},{cut}", "none", SW)
        if kind == "shrewd":
            b += path(f"M{cx-rx+4},{EY+ry-8} Q{cx},{EY+ry-16} {cx+rx-4},{EY+ry-8}", skin, 0)
            b += path(f"M{cx-rx+6},{EY+ry-12} Q{cx},{EY+ry-18} {cx+rx-6},{EY+ry-12}", "none", SW - 2)
    b += ell(cx, EY, rx, ry, "none", SW)
    return b


def eyes(kind_l, kind_r, skin, look=(0, 0), big=1.0):
    # half/shrewd lids are drawn over the eye with skin; keep them inside the eye using a clip
    def one(cx, k):
        inner = eye(cx, k, skin, look, big)
        if k in ("half", "shrewd"):
            cid = f"clip{cx}{k}{int(big*10)}"
            rx, ry = 27 * big + SW / 2, 31 * big + SW / 2
            return (f'<clipPath id="{cid}"><ellipse cx="{cx}" cy="{EY}" rx="{rx}" ry="{ry}"/></clipPath>'
                    f'<g clip-path="url(#{cid})">{inner}</g>')
        return inner
    return g(one(EL, kind_l) + one(ER, kind_r), 'id="eyes"')


def brow(cx, ang, dy=0, thick=12, color=INK, length=58):
    """ang>0: inner end lower (angry). Side-aware."""
    side = -1 if cx < 256 else 1
    a = math.radians(ang)
    y0 = EY - 52 + dy
    xi, yi = cx - side * length / 2, y0 + math.sin(a) * length / 2
    xo, yo = cx + side * length / 2, y0 - math.sin(a) * length / 2
    return line(xi, yi, xo, yo, thick, color)


def brows(l, r, dl=0, dr=0, color=INK, thick=12):
    return g(brow(EL, l, dl, thick, color) + brow(ER, r, dr, thick, color), 'id="brows"')


MOUTH_DARK = "#8a1a33"


def mouth(kind, my=318):
    if kind == "flat":
        b = path(f"M218,{my} Q256,{my+6} 294,{my}", "none", SW)
    elif kind == "smile":
        b = path(f"M210,{my-6} Q256,{my+24} 302,{my-6}", "none", SW)
    elif kind == "smirk":
        b = path(f"M222,{my+4} Q266,{my+10} 300,{my-14}", "none", SW) + path(f"M296,{my-20} q10,4 8,14", "none", SW - 2)
    elif kind == "frown":
        b = path(f"M216,{my+10} Q256,{my-14} 296,{my+10}", "none", SW)
    elif kind == "pursed":
        b = path(f"M240,{my} Q256,{my-4} 272,{my}", "none", SW) + path(f"M232,{my-4} q-4,4 0,8", "none", SW - 3)
    elif kind == "talk":
        b = path(f"M226,{my-6} Q256,{my-2} 286,{my-6} Q280,{my+20} 256,{my+20} Q232,{my+20} 226,{my-6} Z", MOUTH_DARK, SW)
        b += path(f"M240,{my+12} Q256,{my+4} 272,{my+12} Q264,{my+19} 256,{my+19} Q248,{my+19} 240,{my+12} Z", C["coral_light"], 0)
    elif kind == "grin":
        b = path(f"M192,{my-22} Q256,{my-14} 320,{my-22} Q310,{my+34} 256,{my+36} Q202,{my+34} 192,{my-22} Z", C["shell"], SW)
        b += path(f"M200,{my-4} Q256,{my+6} 312,{my-4}", "none", SW - 3)
        for x in (226, 256, 286):
            b += line(x, my - 16, x, my + 26, SW - 4)
    elif kind == "grimace":
        b = rect(204, my - 22, 104, 42, C["shell"], SW, rx=16) + line(208, my - 1, 304, my - 1, SW - 3)
        for x in (226, 246, 266, 286):
            b += line(x, my - 20, x, my + 18, SW - 4)
    elif kind == "open":
        b = path(f"M200,{my-18} Q256,{my-8} 312,{my-18} Q304,{my+40} 256,{my+42} Q208,{my+40} 200,{my-18} Z", MOUTH_DARK, SW)
        b += path(f"M206,{my-15} Q256,{my-6} 306,{my-15} L302,{my-4} Q256,{my+4} 210,{my-4} Z", C["shell"], 0)
        b += path(f"M226,{my+28} Q256,{my+8} 286,{my+28} Q276,{my+40} 256,{my+40} Q236,{my+40} 226,{my+28} Z", C["coral_light"], 0)
        b += path(f"M200,{my-18} Q256,{my-8} 312,{my-18} Q304,{my+40} 256,{my+42} Q208,{my+40} 200,{my-18} Z", "none", SW)
    elif kind == "shout":
        b = ell(256, my + 6, 34, 28, MOUTH_DARK, SW) + path(f"M232,{my-12} Q256,{my-4} 280,{my-12}", C["shell"], 3)
        b += ell(256, my + 22, 18, 8, C["coral_light"], 0)
    elif kind == "wobbly":
        b = path(f"M212,{my} q11,-10 22,0 q11,10 22,0 q11,-10 22,0 q11,10 22,0", "none", SW)
    elif kind == "o":
        b = ell(256, my + 2, 14, 17, MOUTH_DARK, SW)
    else:
        b = ""
    return g(b, 'id="mouth"')


def nose(skin, kind="button"):
    if kind == "long":
        return path("M256,236 Q248,272 238,282 Q256,292 270,280", shade(skin, 0.82), SW - 1)
    return path("M248,258 Q240,282 256,286 Q274,284 266,262", shade(skin, 0.82), SW - 1)


def blush():
    return g(ell(175, 270, 24, 12, C["hot_pink"], 0, extra='opacity="0.45"')
             + ell(337, 270, 24, 12, C["hot_pink"], 0, extra='opacity="0.45"'), 'id="blush"')


def sweat_drops(n=3):
    out = ""
    spots = [(396, 150, 1.0, 15), (420, 210, 0.75, 20), (110, 160, 0.8, -15)][:n]
    for x, y, s, r in spots:
        out += g(path("M0,-26 Q16,-4 16,8 A16,16 0 0 1 -16,8 Q-16,-4 0,-26 Z", C["hot_cyan"], 5)
                 + path("M-6,4 Q-7,-4 -2,-11", "none", 4, extra=f'stroke="{C["shell"]}"'),
                 f'transform="translate({x} {y}) rotate({r}) scale({s})"')
    return g(out, 'id="fx-sweat"')


def sparkles(pts=((420, 110), (96, 140), (440, 300))):
    out = ""
    for i, (x, y) in enumerate(pts):
        s = 1 - i * 0.2
        out += path(f"M{x},{y-22*s} L{x+5*s},{y-5*s} L{x+22*s},{y} L{x+5*s},{y+5*s} L{x},{y+22*s} L{x-5*s},{y+5*s} L{x-22*s},{y} L{x-5*s},{y-5*s} Z",
                    C["gold_light"], 4)
    return g(out, 'id="fx-sparkle"')


def nod_lines():
    return g(path("M96,180 q-20,30 0,60", "none", 6) + path("M74,170 q-26,40 0,80", "none", 5)
             + path("M416,180 q20,30 0,60", "none", 6) + path("M438,170 q26,40 0,80", "none", 5), 'id="fx-nod"')


def vein(x=380, y=120):
    return g(path(f"M{x-14},{y} q14,-4 14,-16 M{x},{y+14} q4,-14 16,-14 M{x+14},{y+30} q-14,4 -14,16 M{x+30},{y+16} q-4,14 -16,14",
                  "none", 6, extra=f'stroke="{C["coral"]}"'), 'id="fx-vein"')


# ---------------------------------------------------------------- hands

def hand(x, y, kind, skin, rot=0, s=1.0, extra_inner=""):
    sh = shade(skin)
    b = ""
    if kind == "palm":  # open palm facing camera
        for i, (fx, fl) in enumerate(((-30, 58), (-10, 70), (10, 70), (30, 60))):
            b += rect(fx - 9, -fl, 18, fl, skin, 6, rx=9)
        b += path("M-40,-6 Q-74,-30 -70,-48 Q-58,-56 -44,-34 L-30,-18", skin, 6)
        b += rect(-42, -18, 84, 70, skin, 6, rx=30)
        b += path("M-20,20 Q0,30 22,18", "none", 4, extra=f'stroke="{sh}"')
    elif kind == "point":  # pointing straight at the camera
        b += rect(-44, -36, 88, 76, skin, 6, rx=28)
        for k in range(3):
            b += path(f"M{-36+k*22},-6 q10,10 20,0", "none", 4)
        b += circ(4, -30, 30, skin, 6) + path("M-10,-46 Q4,-56 18,-46 Q14,-36 4,-36 Q-6,-36 -10,-46 Z", C["sand"], 4)
        b += path("M-60,-10 Q-50,-26 -36,-20", "none", 5)
    elif kind == "fist":
        b += rect(-40, -34, 80, 70, skin, 6, rx=26)
        for k in range(4):
            b += path(f"M{-32+k*18},-34 q8,16 0,30", "none", 4)
        b += path("M-40,0 Q-52,-22 -30,-30", skin, 6)
    elif kind == "thumb":
        b += rect(-40, -20, 80, 64, skin, 6, rx=24)
        for k in range(3):
            b += line(-28, -4 + k * 16, 28, -4 + k * 16, 4)
        b += rect(-38, -78, 30, 66, skin, 6, rx=15)
    elif kind == "hold":
        b += extra_inner
        b += rect(-42, -26, 84, 56, skin, 6, rx=24)
        for k in range(3):
            b += line(-16 + k * 18, -24, -16 + k * 18, 2, 4)
    return g(b, f'transform="translate({x} {y}) rotate({rot}) scale({s})"')


# ---------------------------------------------------------------- body / head

def base_head(skin, jaw="round"):
    sh = shade(skin)
    b = ell(116, 238, 22, 34, skin, SW) + ell(396, 238, 22, 34, skin, SW)
    b += path("M118,236 q8,-8 10,6", "none", 4, extra=f'stroke="{sh}"') + path("M394,236 q-8,-8 -10,6", "none", 4, extra=f'stroke="{sh}"')
    if jaw == "square":
        d = "M126,130 Q130,60 256,58 Q382,60 386,130 L390,300 Q386,372 300,384 L212,384 Q126,372 122,300 Z"
    elif jaw == "long":
        d = "M128,190 Q128,56 256,56 Q384,56 384,190 Q384,330 300,378 Q256,396 212,378 Q128,330 128,190 Z"
    else:
        d = "M118,210 Q118,58 256,58 Q394,58 394,210 Q394,370 256,382 Q118,370 118,210 Z"
    b += path(d, skin, SW)
    # one darker shadow shape under the cheekbone (right side)
    b += path("M372,250 Q368,330 300,362 Q350,350 380,290 Z", sh, 0)
    return b


def neck(skin):
    return rect(214, 340, 84, 90, shade(skin), SW)


def torso(color, shoulders=1.0, top=422):
    l, r = 256 - 216 * shoulders, 256 + 216 * shoulders
    return path(f"M{l-10},516 Q{l},{top+8} {256-110},{top-4} L{256+110},{top-4} Q{r},{top+8} {r+10},516 Z", color, SW)


def compose(name, title, parts):
    body = "".join(f'<g id="{k}">{v}</g>' for k, v in parts if v)
    return svg(512, 512, body, title)


# ---------------------------------------------------------------- characters

def jordan(expr):
    skin = C["skin_light"]
    suit = "#f6e8d0"
    tie_rot = 14 if expr == "panic" else 0
    body = ""
    # shoulder pads: massive
    body += path("M-10,516 Q-6,430 60,404 L190,396 L322,396 L452,404 Q518,430 522,516 Z", suit, SW)
    body += path("M60,404 Q40,440 44,516", "none", 5, extra=f'stroke="{C["beige_shadow"]}"')
    body += path("M452,404 Q472,440 468,516", "none", 5, extra=f'stroke="{C["beige_shadow"]}"')
    # shirt + collar too big
    body += path("M196,398 L256,500 L316,398 Z", C["shell"], SW)
    body += path("M190,392 L256,440 L232,470 L176,414 Z", C["shell"], SW) + path("M322,392 L256,440 L280,470 L336,414 Z", C["shell"], SW)
    # lapels (double-breasted)
    body += path("M176,414 L232,470 L256,516 L200,516 L150,430 Z", shade(suit, 0.92), SW)
    body += path("M336,414 L280,470 L256,516 L312,516 L362,430 Z", shade(suit, 0.92), SW)
    body += circ(226, 498, 7, C["gold"], 4) + circ(286, 498, 7, C["gold"], 4)
    tie = path("M240,440 L272,440 L264,462 L290,516 L222,516 L248,462 Z", C["hot_yellow"], SW)
    tie += circ(256, 486, 7, C["coral"], 0) + circ(240, 506, 5, C["coral"], 0) + circ(272, 504, 5, C["coral"], 0)
    tie += path("M240,440 L272,440 L264,462 L248,462 Z", C["coral"], SW - 2)
    body += g(tie, f'transform="rotate({tie_rot} 256 440)"')
    body += path("M380,446 l18,-12 l14,10 l-12,16 Z", C["hot_pink"], 5)  # pocket square
    head = base_head(skin)
    hair = path("M112,214 Q96,44 256,40 Q416,44 400,214 Q392,150 352,124 Q300,100 256,104 Q200,104 160,124 Q120,150 112,214 Z", C["wood_dark"], SW)
    hair += path("M150,150 Q200,80 300,74", "none", 5, extra=f'stroke="{C["gold_light"]}"')
    hair += path("M176,124 Q230,74 340,84", "none", 4, extra=f'stroke="{C["gold_light"]}"')
    hair += path("M210,104 Q260,72 362,100", "none", 4, extra=f'stroke="{C["gold_light"]}"')
    hair += path("M300,60 Q350,66 380,100 Q340,80 300,76 Z", C["shell"], 0, extra='opacity="0.7"')
    face = nose(skin)
    props = ""
    fx = ""
    if expr == "grin":
        face += eyes("half", "half", skin) + brows(-8, -8, -4, -4) + mouth("grin")
        props = hand(440, 470, "thumb", skin, -10) + rect(404, 470, 72, 34, C["gold"], 5, rx=10) + circ(440, 487, 12, C["gold_light"], 4)
    elif expr == "panic":
        face += eyes("wide", "wide", skin, (4, -2)) + brows(-22, -22, -14, -14) + mouth("grimace", 322)
        fx = sweat_drops(3)
        props = hand(160, 448, "fist", skin, -30)  # tugging collar
    else:  # rich
        face += brows(-10, 10, -14, -4) + mouth("smirk")
        face += g(path("M160,196 L244,196 Q244,258 202,258 Q164,258 160,196 Z", INK, SW)
                  + path("M268,196 L352,196 Q350,258 310,258 Q268,258 268,196 Z", INK, SW)
                  + line(244, 204, 268, 204, SW) + line(160, 200, 120, 210, SW) + line(352, 200, 392, 210, SW)
                  + text(202, 240, "$", 44, C["lime"]) + text(310, 240, "$", 44, C["lime"])
                  + path("M176,206 L196,206", "none", 4, extra=f'stroke="{C["shell"]}"'), 'id="sunglasses"')
        props = g(rect(0, -9, 120, 20, C["wood_dark"], 5, rx=9) + rect(0, -9, 18, 20, C["coral"], 4) + ell(120, 1, 6, 10, "#c9ced3", 4),
                  'transform="translate(296 312) rotate(14)"')
        props += path("M420,330 q-16,-20 0,-40 q16,-20 0,-40", "none", 5, extra=f'stroke="{C["ink_faint"]}"')
        cash = "".join(g(rect(-40, -60, 80, 120, C["lime"], 5, rx=4) + text(0, 12, "$", 34, C["palm"]), f'transform="rotate({a})"') for a in (-30, -12, 6, 24))
        props += g(cash, 'transform="translate(90 440)"') + hand(90, 470, "hold", skin)
        fx = sparkles()
    return compose("jordan", f"Jordan Beltford - {expr}",
                   [("body", body), ("neck", neck(skin)), ("head", head), ("hair", hair), ("face", face), ("props", props), ("fx", fx)])


def brenda(expr):
    skin = C["skin_mid"]
    scrubs = C["sky"]
    hair_c = C["brass"]
    back_hair = path("M106,200 Q96,60 256,52 Q416,60 406,200 L414,360 Q380,392 350,360 L162,360 Q132,392 98,360 Z", hair_c, SW)
    body = torso(scrubs) + path("M206,418 L256,476 L306,418", shade(scrubs), SW)
    body += rect(130, 470, 70, 46, shade(scrubs, 0.92), 5, rx=6) + line(146, 470, 146, 500, 4) + line(160, 470, 160, 496, 4, C["coral"])
    head = base_head(skin, "long")
    mask = path("M196,356 Q256,380 316,356 L322,410 Q256,430 190,410 Z", C["shell"], SW)
    mask += line(204, 376, 308, 376, 3) + line(200, 394, 312, 394, 3)
    mask += path("M190,370 Q140,330 132,260", "none", 4) + path("M322,370 Q372,330 380,260", "none", 4)
    hair = path("M128,190 Q140,70 256,66 Q372,70 384,190 Q360,120 290,110 Q240,140 170,130 Q140,150 128,190 Z", hair_c, SW)
    hair += path("M160,120 Q200,90 250,96", "none", 4, extra=f'stroke="{C["gold_light"]}"')
    glasses = g(circ(206, 92, 26, C["glass"], SW - 1) + circ(306, 92, 26, C["glass"], SW - 1) + path("M232,90 Q256,80 280,90", "none", SW - 1), 'id="glasses-up"')
    face = nose(skin, "long")
    props = ""
    fx = ""
    mirror = rect(-4, -150, 8, 130, "#c9ced3", 4, rx=4) + circ(0, -164, 20, C["glass"], 5) + circ(-5, -169, 6, C["shell"], 0)
    if expr == "neutral":
        face += eyes("half", "half", skin, (12, 0)) + brows(-4, -6, 0, -2) + mouth("smile", 312)
        props = hand(420, 480, "hold", skin, 8, extra_inner=mirror)
    elif expr == "resist":
        face += eyes("open", "open", skin, (-14, 0)) + brows(-20, -18, -8, -8) + mouth("grimace", 316)
        fx = sweat_drops(1)
        props = hand(420, 480, "hold", skin, 20, extra_inner=mirror)
    else:
        face += eyes("happy", "happy", skin) + brows(-12, -12, -14, -14) + mouth("open", 312) + blush()
        props = hand(424, 430, "hold", skin, -18, extra_inner=mirror)
        fx = sparkles(((440, 110), (90, 120)))
    return compose("brenda", f"Dr. Brenda Kalb - {expr}",
                   [("back-hair", back_hair), ("body", body), ("neck", neck(skin)), ("mask", ""), ("head", head), ("hair", hair),
                    ("glasses", glasses), ("face", face), ("mask-chin", mask), ("props", props), ("fx", fx)])


def kai(expr):
    skin = C["skin_deep"]
    body = torso(C["shell"]) + path("M150,418 L60,516 L150,516 L210,430 Z", C["hot_pink"], SW) + path("M362,418 L452,516 L362,516 L302,430 Z", C["hot_pink"], SW)
    body += path("M40,516 Q46,440 150,418 L60,516 Z", C["hot_pink"], SW) + path("M472,516 Q466,440 362,418 L452,516 Z", C["hot_pink"], SW)
    body += path("M226,470 L256,440 L286,470 L272,470 L272,500 L240,500 L240,470 Z", C["lime"], 5)  # rocket/arrow tee graphic
    head = base_head(skin)
    hair = path("M126,170 Q136,92 256,88 Q376,92 386,170 Q350,140 256,138 Q162,140 126,170 Z", C["ink"], SW)
    cap = path("M120,168 Q120,50 256,46 Q392,50 392,168 Q330,150 256,150 Q182,150 120,168 Z", C["hot_cyan"], SW)
    cap += path("M224,150 Q256,120 288,150", C["ink"], 5) + line(222, 150, 290, 150, 5)  # strap at the front (it's backwards)
    cap += path("M392,140 Q440,150 452,176 Q420,180 390,170", shade(C["hot_cyan"]), SW)  # brim poking out behind
    cap += circ(256, 50, 9, C["hot_cyan"], 5)
    pods = g(rect(92, 244, 16, 40, C["shell"], 4, rx=8) + rect(404, 244, 16, 40, C["shell"], 4, rx=8), 'id="airpods"')
    face = nose(skin)
    phone = rect(-34, -150, 68, 120, C["ink"], 5, rx=10) + rect(-26, -140, 52, 96, C["sky_pale"], 0, rx=4) + path("M-20,-56 L-6,-76 L4,-68 L20,-130", "none", 5, extra=f'stroke="{C["palm"]}"')
    props = ""
    fx = ""
    if expr == "neutral":
        face += eyes("ring", "ring", skin, (-6, 0)) + brows(-6, 8, -4, 0) + mouth("talk", 316)
        props = hand(410, 496, "hold", skin, 6, extra_inner=phone)
    elif expr == "resist":
        face += eyes("ring", "ring", skin, (0, -2)) + brows(-16, -16, -14, -14) + mouth("open", 312)
        props = hand(90, 420, "palm", skin, -14) + hand(422, 420, "palm", skin, 14)
    else:
        face += eyes("dollar", "dollar", skin) + brows(-18, -18, -18, -18) + mouth("open", 312)
        props = hand(410, 470, "hold", skin, -10, extra_inner=phone)
        fx = sparkles()
    return compose("kai", f"Kai Mercer - {expr}",
                   [("body", body), ("neck", neck(skin)), ("head", head), ("hair", hair), ("cap", cap), ("airpods", pods),
                    ("face", face), ("props", props), ("fx", fx)])


def eunice(expr):
    skin = C["skin_light"]
    card = C["coral_light"]
    body = torso(card) + path("M196,418 L256,470 L316,418 Z", C["shell"], SW)
    body += path("M196,418 L226,452 L256,430 M316,418 L286,452 L256,430", "none", SW)
    # brooch
    for k in range(6):
        a = math.radians(k * 60)
        body += circ(150 + math.cos(a) * 16, 470 + math.sin(a) * 16, 13, C["hot_pink"], 4)
    body += circ(150, 470, 11, C["gold_light"], 4)
    # Walter's photo at the edge
    body += g(rect(0, 0, 96, 118, C["gold"], 5) + rect(10, 10, 76, 98, C["sky_pale"], 4) + circ(48, 52, 20, C["skin_mid"], 4)
              + path("M34,62 Q48,54 62,62", "none", 5) + path("M24,108 Q48,76 72,108", C["ink_soft"], 4),
              'transform="translate(410 380) rotate(8)"')
    head = base_head(skin)
    perm = ""
    for r_ in range(3):
        for k in range(9 - r_):
            x = 140 + k * (232 / (8 - r_)) if 8 - r_ else 256
            y = 120 - r_ * 34 + (abs(k - (8 - r_) / 2) * 8)
            perm += circ(x, y, 30, C["shell"], SW - 1)
    perm += circ(130, 190, 26, C["shell"], SW - 1) + circ(382, 190, 26, C["shell"], SW - 1)
    specs = g(circ(EL, EY, 52, C["glass"], SW, extra='fill-opacity="0.55"') + circ(ER, EY, 52, C["glass"], SW, extra='fill-opacity="0.55"')
              + path("M252,214 Q256,206 260,214", "none", SW) + line(153, 214, 120, 206, SW) + line(359, 214, 392, 206, SW), 'id="spectacles"')
    face = nose(skin)
    hs = AVOCADO
    rot_handset = g(path("M-30,-90 Q-46,0 -30,90", "none", 30, extra=f'stroke="{hs}"') + path("M-30,-90 Q-46,0 -30,90", "none", 18, extra=f'stroke="{shade(hs,1.1)}"')
                    + ell(-24, -104, 34, 22, hs, 6) + ell(-24, 104, 34, 22, hs, 6), 'transform="translate(110 380) rotate(-10)"')
    props = rot_handset + hand(110, 420, "fist", skin, 10) + hand(150, 470, "fist", skin, -4)
    props += path("M90,486 q-30,10 -40,30", "none", 5)
    fx = ""
    if expr == "neutral":
        face += eyes("closed", "closed", skin) + brows(-6, -6, -6, -6, color=C["ink_faint"], thick=9) + mouth("smile", 316)
    elif expr == "resist":
        face += eyes("shrewd", "open", skin, (4, 0), 1.1) + brows(10, -24, 4, -20, color=C["ink_faint"], thick=9) + mouth("pursed", 318)
    else:
        face += eyes("happy", "happy", skin) + brows(-14, -14, -12, -12, color=C["ink_faint"], thick=9) + mouth("open", 314) + blush()
        fx = sparkles(((440, 96), (80, 96)))
    return compose("eunice", f"Eunice Pell - {expr}",
                   [("body", body), ("neck", neck(skin)), ("head", head), ("perm", perm), ("face", face), ("spectacles", specs),
                    ("props", props), ("fx", fx)])


def dale(expr):
    skin = C["skin_mid"]
    body = torso(C["shell"], 1.08) + path("M200,418 L256,450 L312,418", "none", SW)
    body += path("M244,446 L268,446 L262,462 L276,516 L236,516 L250,462 Z", C["brass"], SW)
    body += rect(300, 460, 50, 40, C["sand"], 5) + line(312, 470, 340, 470, 4, C["coral"]) + line(312, 480, 340, 480, 4, C["sky_deep"])
    # short sleeves + thick forearms
    body += path("M24,516 Q30,470 70,450 L120,470 L110,516 Z", C["shell"], SW)
    head = base_head(skin, "square")
    hair = path("M128,128 L128,92 Q132,64 256,62 Q380,64 384,92 L384,128 Q370,104 256,102 Q142,104 128,128 Z", HAIR_GREY, SW)
    for x in range(150, 370, 22):
        hair += line(x, 70, x, 96, 3, C["ink_faint"])
    lines_ = path("M250,174 L246,196 M264,174 L268,196", "none", 5) + path("M200,290 Q190,320 206,348 M312,290 Q322,320 306,348", "none", 5)
    face = nose(skin, "long") + lines_
    readers = g(rect(170, 262, 76, 34, C["glass"], SW - 1, rx=10, extra='fill-opacity="0.6"') + rect(266, 262, 76, 34, C["glass"], SW - 1, rx=10, extra='fill-opacity="0.6"')
                + path("M246,272 Q256,262 266,272", "none", SW - 1), 'id="readers"')
    calc = rect(-44, -130, 88, 120, C["sand_dim"], 5, rx=8) + rect(-34, -120, 68, 26, C["palm"], 4) + text(0, -101, "0.00", 16, C["lime"], family="monospace")
    calc += "".join(rect(-32 + c * 22, -86 + r * 20, 18, 14, C["shell"], 3, rx=2) for r in range(4) for c in range(3))
    props = ""
    fx = ""
    if expr == "neutral":
        face += eyes("half", "half", skin, (10, 6)) + brows(6, 6, 2, 2, thick=16) + mouth("frown", 330)
        props = hand(96, 500, "hold", skin, -6, extra_inner=calc)
    elif expr == "resist":
        face += eyes("shrewd", "shrewd", skin, (0, 2)) + brows(22, 22, 8, 8, thick=16) + mouth("shout", 324)
        props = hand(380, 430, "point", skin, 0, 1.4)
        fx = vein()
    else:
        face += eyes("half", "open", skin) + brows(6, -20, 2, -18, thick=16) + mouth("flat", 332)
        fx = nod_lines()
        props = hand(96, 500, "hold", skin, -6, extra_inner=calc)
    return compose("dale", f"Dale Hochstetter - {expr}",
                   [("body", body), ("neck", neck(skin)), ("head", head), ("hair", hair), ("face", face), ("readers", readers),
                    ("props", props), ("fx", fx)])


def saffron(expr):
    skin = C["skin_light"]
    beige = C["sand_dim"]
    tilt = 6 if expr == "neutral" else 0
    back_hair = path("M112,200 Q100,50 256,46 Q412,50 400,200 Q420,300 430,420 Q440,480 400,516 L112,516 Q72,480 82,420 Q92,300 112,200 Z", C["gold_light"], SW)
    back_hair += path("M96,300 q20,40 0,80 q-16,40 6,80 M416,300 q-20,40 0,80 q16,40 -6,80", "none", 5, extra=f'stroke="{C["gold"]}"')
    body = torso(beige) + path("M256,422 L256,516", "none", 4) + rect(248, 436, 16, 26, C["brass"], 3, rx=3)
    body += path("M210,422 Q256,470 302,422", "none", 3) + path("M248,462 L256,490 L264,462 L256,450 Z", C["hot_cyan"], 4)
    head = base_head(skin, "long")
    hair = path("M128,200 Q130,70 256,64 Q382,70 384,200 Q370,120 300,104 Q290,150 220,150 Q160,150 128,200 Z", C["gold_light"], SW)
    hair += path("M300,104 Q330,140 340,200", "none", 5, extra=f'stroke="{C["gold"]}"')
    face = nose(skin, "long")
    jar = rect(-30, -150, 60, 120, C["glass"], 5, rx=10) + rect(-24, -120, 48, 86, C["lime"], 0, rx=6) + rect(-34, -158, 68, 16, C["brass"], 4, rx=4)
    jar += line(10, -158, 24, -200, 7, C["hot_pink"])
    props = ""
    fx = ""
    if expr == "neutral":
        face += eyes("half", "half", skin) + brows(-4, -4, -2, -2, thick=9) + mouth("smile", 316)
        props = hand(400, 500, "hold", skin, 4, extra_inner=jar)
    elif expr == "resist":
        face += eyes("closed", "closed", skin) + brows(-10, -10, -8, -8, thick=9) + mouth("flat", 318)
        props = hand(410, 430, "palm", skin, 10, 1.1)
    else:
        face += eyes("open", "open", skin, (0, -4), 1.1) + brows(-14, -14, -16, -16, thick=9) + mouth("open", 312) + blush()
        props = hand(400, 480, "hold", skin, -8, extra_inner=jar)
        fx = sparkles()
    headgroup = g(f'<g id="head">{head}</g><g id="hair">{hair}</g><g id="face">{face}</g>', f'transform="rotate({tilt} 256 380)"')
    return compose("saffron", f"Saffron Vey - {expr}",
                   [("back-hair", back_hair), ("body", body), ("neck", neck(skin)), ("headgroup", headgroup), ("props", props), ("fx", fx)])


def gil(expr):
    skin = C["skin_mid"]
    body = torso(OLIVE, 1.04) + path("M180,418 L256,516 L332,418", shade(OLIVE), SW)
    body += rect(150, 450, 56, 40, shade(OLIVE, 0.9), 5) + rect(306, 450, 56, 40, shade(OLIVE, 0.9), 5)
    # peach cans (bunker supplies) in the corner
    for i, (x, y) in enumerate(((20, 430), (76, 430), (48, 372))):
        body += rect(x, y, 52, 60, "#c9ced3", 5, rx=4) + rect(x, y + 14, 52, 30, C["peach"], 4) + circ(x + 26, y + 29, 8, C["gold"], 3)
    head = base_head(skin)
    # harsh one-sided bunker light: dark half on the left
    head += path("M256,62 Q140,64 120,210 Q120,360 256,382 Q200,300 210,210 Q220,110 256,62 Z", shade(skin, 0.72), 0, extra='opacity="0.85"')
    beard = path("M130,250 Q120,330 170,390 Q200,440 256,446 Q312,440 342,390 Q392,330 382,250 Q350,300 300,290 Q256,282 212,290 Q162,300 130,250 Z", HAIR_GREY, SW)
    for x, y in ((170, 340), (220, 380), (290, 380), (340, 340), (256, 420)):
        beard += path(f"M{x-10},{y} q10,-12 20,0", "none", 4, extra=f'stroke="{C["ink_faint"]}"')
    cap = path("M124,166 Q124,58 256,54 Q388,58 388,166 L124,166 Z", C["palm"], SW) + path("M140,120 Q256,70 372,120 L372,160 L140,160 Z", C["shell"], 5)
    cap += text(256, 152, "NO FEDS", 30, C["coral"], family="Impact, 'Arial Black', sans-serif")
    cap += path("M110,166 Q256,190 402,166 Q408,188 380,196 Q256,212 132,196 Q104,188 110,166 Z", shade(C["palm"]), SW)
    hs = rect(-24, -110, 48, 220, C["ink_soft"], 5, rx=22) + ell(0, -110, 34, 24, C["ink_soft"], 5) + ell(0, 110, 34, 24, C["ink_soft"], 5)
    phone_ = g(hs, 'transform="translate(418 290) rotate(-12)"') + path("M440,400 q30,20 10,40 q-20,20 10,40 q30,20 10,40", "none", 5)
    face = nose(skin)
    props = phone_ + hand(410, 352, "fist", skin, -10)
    fx = ""
    if expr == "neutral":
        face += eyes("squint", "squint", skin) + brows(18, 18, 10, 10, C["ink"], 14) + mouth("flat", 318)
    elif expr == "resist":
        face += eyes("wide", "squint", skin, (-4, 0)) + brows(-10, 26, -10, 10, C["ink"], 14) + mouth("shout", 316)
        props = hand(130, 420, "point", skin, 0, 1.4) + phone_
    else:
        face += eyes("squint", "squint", skin) + brows(10, 10, 4, 4, C["ink"], 14) + mouth("smile", 314)
        fx = nod_lines()
    return compose("gil", f"Gil Orloff - {expr}",
                   [("body", body), ("neck", neck(skin)), ("head", head), ("beard", beard), ("cap", cap), ("face", face),
                    ("props", props), ("fx", fx)])


CHARS = {
    "jordan": (jordan, ("grin", "panic", "rich")),
    "brenda": (brenda, ("neutral", "resist", "sold")),
    "kai": (kai, ("neutral", "resist", "sold")),
    "eunice": (eunice, ("neutral", "resist", "sold")),
    "dale": (dale, ("neutral", "resist", "sold")),
    "saffron": (saffron, ("neutral", "resist", "sold")),
    "gil": (gil, ("neutral", "resist", "sold")),
}


def gil_fix(svgtext):
    # gil's beard must sit over the mouth area but under the mouth itself: order handled in compose
    return svgtext


def template():
    b = ""
    dash = 'stroke-dasharray="10 8"'
    b += rect(0, 0, 512, 512, "none", 3, extra=f'stroke="{C["ink_faint"]}" {dash}')
    b += ell(256, 220, 138, 162, "none", 4, extra=f'stroke="{C["sky_deep"]}"')
    b += line(256, 30, 256, 500, 2.5, C["sky_deep"], dash) + line(60, EY, 452, EY, 2.5, C["coral"], dash)
    b += line(60, 318, 452, 318, 2.5, C["coral"], dash) + line(60, 160, 452, 160, 2.5, C["gold"], dash)
    b += circ(EL, EY, 30, "none", 3, extra=f'stroke="{C["coral"]}"') + circ(ER, EY, 30, "none", 3, extra=f'stroke="{C["coral"]}"')
    b += line(40, 420, 472, 420, 2.5, C["palm"], dash)
    b += path("M30,516 Q40,430 146,418 L366,418 Q472,430 482,516", "none", 4, extra=f'stroke="{C["palm"]}"')
    b += rect(77, 58, 358, 358, "none", 2.5, extra=f'stroke="{C["hot_purple"]}" {dash}')
    lab = lambda x, y, s, c: text(x, y, s, 14, c, family="monospace", weight=700, anchor="start")
    b += lab(462, EY - 6, "eyes y=222", C["coral"]) + lab(462, 312, "mouth y=318", C["coral"]) + lab(462, 154, "brows ~170", C["gold"])
    b += lab(10, 412, "shoulders y=420", C["palm"]) + lab(82, 52, "head ~70% of frame", C["hot_purple"]) + lab(262, 46, "centre x=256", C["sky_deep"])
    b += lab(10, 500, "stroke #22364a, 7px (1.5%)", INK)
    return svg(512, 512, b, "Character construction template")


def kit():
    """Expression + hand-pose kit, 1600x1000."""
    skin = C["skin_light"]
    cells = []
    face_specs = [
        ("neutral", lambda: eyes("half", "half", skin) + brows(-4, -4) + mouth("flat")),
        ("bored", lambda: eyes("half", "half", skin, (12, 6)) + brows(6, 6) + mouth("frown", 330)),
        ("polite", lambda: eyes("half", "half", skin, (12, 0)) + brows(-4, -6) + mouth("smile", 312)),
        ("resist", lambda: eyes("shrewd", "shrewd", skin) + brows(22, 22, 8, 8) + mouth("shout", 324)),
        ("sceptic", lambda: eyes("shrewd", "open", skin) + brows(10, -24, 4, -20) + mouth("pursed")),
        ("nervous", lambda: eyes("open", "open", skin, (-14, 0)) + brows(-20, -18, -8, -8) + mouth("grimace", 316)),
        ("panic", lambda: eyes("wide", "wide", skin) + brows(-22, -22, -14, -14) + mouth("wobbly", 322)),
        ("sold", lambda: eyes("happy", "happy", skin) + brows(-12, -12, -14, -14) + mouth("open", 312) + blush()),
        ("greed", lambda: eyes("dollar", "dollar", skin) + brows(-18, -18, -18, -18) + mouth("grin")),
        ("smug", lambda: eyes("closed", "closed", skin) + brows(-10, 10, -14, -4) + mouth("smirk")),
        ("suspicious", lambda: eyes("squint", "squint", skin) + brows(18, 18, 10, 10) + mouth("flat")),
        ("talking", lambda: eyes("open", "open", skin, (-6, 0)) + brows(-6, 8, -4, 0) + mouth("talk", 316)),
    ]
    out = ""
    for i, (name, fn) in enumerate(face_specs):
        col, row = i % 6, i // 6
        x, y = 30 + col * 260, 30 + row * 300
        inner = path("M118,210 Q118,58 256,58 Q394,58 394,210 Q394,370 256,382 Q118,370 118,210 Z", skin, SW) + nose(skin) + fn()
        out += g(inner, f'transform="translate({x} {y}) scale(0.46)"')
        out += text(x + 118, y + 210, name, 20, INK, family="monospace")
    hands = [("palm", 0), ("point", 0), ("fist", 0), ("thumb", 0), ("hold", 0)]
    for i, (k, r) in enumerate(hands):
        x = 140 + i * 300
        out += hand(x, 820, k, skin, r, 1.4)
        out += text(x, 930, f"hand: {k}", 20, INK, family="monospace")
    fxs = [("fx: sweat", sweat_drops(3), 180), ("fx: sparkle", sparkles(), 560), ("fx: nod", nod_lines(), 940), ("fx: vein", vein(256, 150), 1320)]
    for lab_, gfx, x in fxs:
        out += g(gfx, f'transform="translate({x-128} 560) scale(0.5)"') + text(x, 700, lab_, 18, INK, family="monospace")
    return svg(1600, 960, out, "Expression and hand-pose kit")


if __name__ == "__main__":
    for name, (fn, exprs) in CHARS.items():
        for e in exprs:
            write(OUT, f"{name}_{e}.svg", fn(e))
    write(OUT, "template_construction.svg", template())
    write(OUT, "kit_expressions_hands.svg", kit())
    print("ok")
