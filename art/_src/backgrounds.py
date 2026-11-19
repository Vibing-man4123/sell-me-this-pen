from svgkit import *

OUT = "/home/claude/art/out"


def skyline(x0, x1, base, clip_id, scale=1.0, sw=4):
    """Pastel art-deco towers along a base line."""
    out = ""
    specs = [  # (relx, w, h, fill, trim)
        (0.00, 120, 170, C["blush"], C["hot_pink"]),
        (0.09, 90, 250, C["cream"], C["hot_cyan"]),
        (0.16, 140, 140, C["peach"], C["gold"]),
        (0.27, 100, 300, C["shell"], C["hot_pink"]),
        (0.35, 130, 200, C["sky_pale"], C["hot_cyan"]),
        (0.46, 110, 160, C["blush"], C["gold"]),
        (0.55, 95, 270, C["peach"], C["hot_pink"]),
        (0.63, 150, 190, C["cream"], C["hot_cyan"]),
        (0.75, 100, 240, C["blush"], C["gold"]),
        (0.84, 130, 150, C["shell"], C["hot_pink"]),
        (0.93, 110, 210, C["peach"], C["hot_cyan"]),
    ]
    W = x1 - x0
    for rx_, w, h, fill, trim in specs:
        w *= scale; h *= scale
        x = x0 + rx_ * W
        y = base - h
        # stepped deco crown
        out += rect(x, y + 24 * scale, w, h - 24 * scale + 10, fill, sw)
        out += rect(x + w * 0.18, y + 8 * scale, w * 0.64, 22 * scale, fill, sw)
        out += rect(x + w * 0.36, y - 8 * scale, w * 0.28, 20 * scale, fill, sw)
        # horizontal deco bands
        for k in range(3):
            yy = y + (60 + k * 16) * scale
            if yy < base - 10:
                out += rect(x + 6, yy, w - 12, 6 * scale, trim, 0)
        # window grid
        rows = int((h - 120 * scale) / (26 * scale))
        for r in range(max(rows, 0)):
            yy = y + (120 + r * 26) * scale
            for cidx in range(3):
                xx = x + w * (0.16 + cidx * 0.27)
                out += rect(xx, yy, w * 0.16, 12 * scale, C["sky"], 0, rx=2)
    return out


def bg_desk():
    W, H = 1600, 900
    b = ""
    # --- wall
    b += rect(0, 0, W, H, C["sand"], 0)
    # pilaster stripes (deco wall panelling)
    for x in (40, 70, 1530, 1560):
        b += rect(x, 60, 6, 560, C["sand_dim"], 0)
    # frieze
    b += rect(0, 0, W, 56, C["blush"], 0) + line(0, 56, W, 56, 5)
    for i in range(0, W + 80, 80):
        b += path(f"M{i},56 L{i+40},14 L{i+80},56", C["peach"], 3.5)
        b += circ(i + 40, 40, 7, C["gold_light"], 3)
    b += rect(0, 60, W, 8, C["brass"], 0)

    # --- window
    wx0, wx1, wy0, wy1 = 210, 1390, 96, 566
    b += f'<clipPath id="win"><rect x="{wx0}" y="{wy0}" width="{wx1-wx0}" height="{wy1-wy0}"/></clipPath>'
    out = ""
    out += rect(wx0, wy0, wx1 - wx0, 220, C["sky"], 0)
    out += rect(wx0, wy0 + 220, wx1 - wx0, 80, C["sky_pale"], 0)
    out += rect(wx0, wy0 + 300, wx1 - wx0, 60, C["peach"], 0)
    # sun + glow rings
    out += circ(1135, 405, 130, "#ffe6c8", 0) + circ(1135, 405, 95, "#ffd79a", 0)
    out += circ(1135, 405, 64, C["gold_light"], 4)
    # clouds
    for cx, cy, s in ((420, 170, 1), (880, 140, 0.8), (1250, 210, 0.7)):
        out += path(f"M{cx-70*s},{cy+18*s} Q{cx-75*s},{cy-12*s} {cx-35*s},{cy-8*s} Q{cx-20*s},{cy-40*s} {cx+15*s},{cy-22*s} "
                    f"Q{cx+55*s},{cy-35*s} {cx+60*s},{cy-2*s} Q{cx+90*s},{cy+2*s} {cx+75*s},{cy+18*s} Z", C["shell"], 4)
    # ocean
    out += rect(wx0, 440, wx1 - wx0, 130, C["sea"], 0) + line(wx0, 440, wx1, 440, 4)
    for i, (x, y) in enumerate([(300, 462), (520, 478), (760, 458), (980, 488), (1240, 470), (420, 500), (1080, 455)]):
        out += line(x, y, x + 46, y, 4, C["sky_pale"])
    for k in range(5):
        out += line(1100 - k * 6, 452 + k * 12, 1170 + k * 6, 452 + k * 12, 5, C["gold_light"])
    # skyline in front of the water
    out += skyline(wx0 - 20, wx1 + 20, 580, "win", 0.62)
    # palms
    out += palm_tree(300, 600, 360, 1)
    out += palm_tree(1300, 600, 400, -1)
    out += palm_tree(1360, 600, 300, -1)
    b += g(out, 'clip-path="url(#win)"')
    # blinds (half drawn)
    bl = ""
    for k in range(9):
        y = wy0 + k * 12
        bl += rect(wx0, y, wx1 - wx0, 12, C["cream"] if k % 2 == 0 else C["sand"], 2.5)
    bl += rect(wx0 - 8, wy0 - 6, wx1 - wx0 + 16, 14, C["brass"], 4)
    bl += line(wx1 - 60, wy0 + 108, wx1 - 60, wy0 + 230, 3) + ell(wx1 - 60, wy0 + 240, 6, 11, C["gold_light"], 3)
    b += bl
    # window frame + mullions
    b += rect(wx0, wy0, wx1 - wx0, wy1 - wy0, "none", 14, extra=f'stroke="{C["shell"]}"')
    b += rect(wx0 - 7, wy0 - 7, wx1 - wx0 + 14, wy1 - wy0 + 14, "none", 5)
    for mx in (603, 997):
        b += rect(mx - 9, wy0, 18, wy1 - wy0, C["shell"], 4)
    # sill
    b += rect(wx0 - 30, wy1, wx1 - wx0 + 60, 22, C["cream"], 5)

    # golden-hour light falling into the room
    for x0, w0 in ((420, 150), (820, 110), (1120, 160)):
        b += poly([(x0, 588), (x0 + w0, 588), (x0 + w0 - 240, 900), (x0 - 300, 900)], C["gold_light"], 0, extra='opacity="0.16"')
    # --- wall clock (4:05) left
    cx, cy = 112, 250
    b += circ(cx, cy, 66, C["brass"], 5) + circ(cx, cy, 52, C["cream"], 4)
    for k in range(12):
        a = math.radians(k * 30)
        b += line(cx + math.sin(a) * 42, cy - math.cos(a) * 42, cx + math.sin(a) * 48, cy - math.cos(a) * 48, 4)
    ah = math.radians(4 * 30 + 2.5); am = math.radians(5 * 6)
    b += line(cx, cy, cx + math.sin(ah) * 26, cy - math.cos(ah) * 26, 7)
    b += line(cx, cy, cx + math.sin(am) * 40, cy - math.cos(am) * 40, 4.5, C["coral"])
    b += circ(cx, cy, 5, C["ink"], 0)
    # --- framed chart right
    b += rect(1428, 170, 150, 120, C["gold"], 5) + rect(1442, 184, 122, 92, C["shell"], 4)
    b += path("M1452,262 L1480,246 L1500,254 L1524,220 L1552,196", "none", 5, extra=f'stroke="{C["palm"]}"')
    b += path("M1540,194 L1554,194 L1554,208", "none", 5, extra=f'stroke="{C["palm"]}"')
    b += rect(1460, 300, 86, 18, C["brass"], 3)  # nameplate
    # potted palm far left
    b += palm_tree(110, 650, 260, 0.4, frond="#3a9a7c")

    # --- desk
    b += rect(0, 618, W, 30, C["wood_dark"], 5)  # back edge / far lip
    b += rect(0, 646, W, H - 646, C["wood"], 0)
    for y, x0, x1 in ((690, 0, 260), (760, 60, 220), (830, 0, 180), (700, 1330, 1600), (860, 1380, 1560)):
        b += path(f"M{x0},{y} q{(x1-x0)/2},-10 {x1-x0},0", "none", 3.5, extra=f'stroke="{C["wood_dark"]}"')
    # felt pad with leather edge
    pad = [(290, 664), (1310, 664), (1400, 905), (200, 905)]
    b += poly(pad, C["leather"], 5)
    b += poly([(316, 680), (1284, 680), (1366, 905), (234, 905)], C["palm"], 4)
    for k in range(10):
        x = 360 + k * 100
        b += line(x, 690, x - 40, 900, 2, C["felt_dark"])
    # coffee ring stain
    b += circ(420, 870, 38, "none", 5, extra=f'stroke="{C["felt_dark"]}"')
    b += circ(434, 862, 30, "none", 3, extra=f'stroke="{C["felt_dark"]}" stroke-dasharray="40 18"')
    # loose papers (left, under the phone slot)
    b += g(rect(-10, 0, 220, 150, C["sand"], 4) + "".join(line(10, 26 + k * 18, 160, 26 + k * 18, 3, C["ink_faint"]) for k in range(6)),
           'transform="translate(60 700) rotate(-8)"')
    b += g(rect(0, 0, 220, 150, C["shell"], 4) + "".join(line(18, 30 + k * 18, 150 + (k % 2) * 30, 30 + k * 18, 3, C["ink_faint"]) for k in range(6))
           + text(150, 136, "SOLD?", 22, C["coral"], extra='transform="rotate(-6 150 136)"'),
           'transform="translate(150 720) rotate(6)"')

    # right side: rolodex
    rx, ry = 1250, 690
    b += ell(rx + 80, ry + 122, 96, 14, C["wood_dark"], 0)
    b += rect(rx + 10, ry + 96, 140, 26, C["ink_soft"], 5, rx=6)
    for k in range(7):
        b += g(rect(0, 0, 112, 70, C["shell"] if k % 2 else C["sand"], 3.5, rx=6), f'transform="translate({rx+22+k*3} {ry+16+k*6}) rotate({-14+k*5} 56 70)"')
    b += circ(rx + 24, ry + 104, 14, C["brass"], 4) + circ(rx + 136, ry + 104, 14, C["brass"], 4)
    # mug
    mx, my = 1440, 700
    b += path(f"M{mx+78},{my+28} q36,4 30,40 q-6,28 -34,22", "none", 9)
    b += path(f"M{mx+78},{my+28} q36,4 30,40 q-6,28 -34,22", "none", 4, extra=f'stroke="{C["shell"]}"')
    b += path(f"M{mx},{my} L{mx+86},{my} L{mx+80},{my+104} Q{mx+43},{my+114} {mx+6},{my+104} Z", C["shell"], 5)
    b += ell(mx + 43, my, 43, 11, C["wood_dark"], 5)
    b += text(mx + 43, my + 56, "#1", 30, C["hot_pink"]) + text(mx + 43, my + 80, "BROKER", 15, C["ink"])
    # ashtray + cigar
    ax, ay = 1340, 850
    b += ell(ax, ay, 86, 30, C["glass"], 5) + ell(ax, ay - 6, 60, 17, C["sky_pale"], 3.5)
    b += g(rect(0, -9, 110, 18, C["wood_dark"], 4, rx=8) + rect(78, -9, 16, 18, C["coral"], 3) + ell(110, 0, 6, 9, "#9aa4ab", 3),
           f'transform="translate({ax-40} {ay-12}) rotate(-12)"')
    b += path(f"M{ax+70},{ay-40} q-14,-16 0,-30 q14,-14 0,-30", "none", 4, extra=f'stroke="{C["ink_faint"]}"')
    # sandwich (half eaten) on paper
    sx, sy = 1470, 800
    b += poly([(sx - 60, sy + 70), (sx + 130, sy + 60), (sx + 140, sy + 90), (sx - 70, sy + 90)], C["sand"], 4)
    b += path(f"M{sx-30},{sy+60} L{sx+90},{sy+56} L{sx+70},{sy+20} q-10,10 -20,0 q-10,-12 -24,-2 L{sx-10},{sy+14} Z", C["gold_light"], 4)
    b += path(f"M{sx-26},{sy+50} L{sx+84},{sy+46}", "none", 6, extra=f'stroke="{C["lime"]}"')
    b += path(f"M{sx-24},{sy+40} L{sx+66},{sy+36}", "none", 6, extra=f'stroke="{C["coral_light"]}"')
    # brass bankers lamp (off), standing on the back right
    lx = 1500
    b += ell(lx, 640, 70, 16, C["brass"], 5)
    b += rect(lx - 7, 470, 14, 170, C["brass"], 4)
    b += path(f"M{lx-110},{470} Q{lx},{400} {lx+70},{470} Z", C["palm"], 5)
    b += path(f"M{lx-90},{462} Q{lx-30},{428} {lx+20},{446}", "none", 4, extra=f'stroke="#53b08f"')
    b += line(lx + 40, 470, lx + 40, 520, 3) + circ(lx + 40, 526, 6, C["gold_light"], 3)

    for x0, w0 in ((420, 150), (820, 110), (1120, 160)):
        b += poly([(x0, 650), (x0 + w0, 650), (x0 + w0 - 200, 900), (x0 - 260, 900)], C["gold_light"], 0, extra='opacity="0.14"')
    # front lip of desk (closest to us)
    b += rect(0, 888, W, 12, C["wood_dark"], 0)
    return svg(W, H, b, "Sell Me This Pen - desk background (call screen)")


def monitor(with_screen=False):
    W, H = 900, 780
    b = ""
    sx0, sy0, sx1, sy1 = 100, 84, 800, 540
    # stand
    b += path("M300,700 L600,700 L650,760 L250,760 Z", C["beige_shadow"], 5)
    b += path("M370,630 L530,630 L560,706 L340,706 Z", C["beige_plastic"], 5)
    # body shadow (gives chunk)
    hole = (sx0, sy0, sx1 - sx0, sy1 - sy0, 22)
    b += holed((44, 34, 836, 612, 42), hole, C["beige_shadow"])
    b += holed((30, 20, 830, 610, 40), hole, C["beige_plastic"])
    # highlight
    b += path("M70,40 L520,40", "none", 6, extra=f'stroke="{C["cream"]}"')
    b += path("M50,70 L50,420", "none", 6, extra=f'stroke="{C["cream"]}"')
    # recess around screen
    b += holed((sx0 - 26, sy0 - 22, sx1 - sx0 + 52, sy1 - sy0 + 44, 30), hole, C["beige_shadow"])
    # screen (the hole). Mask so the chat shows through.
    if with_screen:
        b += rect(sx0, sy0, sx1 - sx0, sy1 - sy0, C["sky_pale"], 0, rx=22)
    b += rect(sx0, sy0, sx1 - sx0, sy1 - sy0, "none", 6, rx=22)
    # chin details
    b += rect(320, 562, 260, 40, C["brass"], 5, rx=6)
    b += text(450, 590, "BELTFORD 486", 22, C["gold_light"], extra='letter-spacing="3"')
    for k in range(6):
        b += rect(90 + k * 26, 570, 12, 34, C["beige_shadow"], 3, rx=5)
    b += circ(700, 584, 20, C["sand"], 5) + circ(752, 584, 14, C["sand"], 4)
    b += circ(800, 584, 8, C["dialtone"], 3)
    # sticky notes
    b += g(rect(0, 0, 120, 110, C["hot_yellow"], 4) + rect(0, 0, 120, 22, "#f2c21f", 0) + rect(0, 0, 120, 110, "none", 4)
           + text(60, 62, "A.B.C.", 24, C["ink"], family="'Comic Sans MS', 'Marker Felt', cursive")
           + text(60, 90, "always be closing", 12, C["ink_soft"], family="'Comic Sans MS', cursive", weight=400),
           'transform="translate(8 -20) rotate(-9)"')
    b += g(rect(0, 0, 104, 96, C["hot_pink"], 4) + rect(0, 0, 104, 18, "#f04b8d", 0) + rect(0, 0, 104, 96, "none", 4)
           + text(52, 48, "CALL", 18, C["shell"], family="'Comic Sans MS', cursive") + text(52, 72, "MOM?", 18, C["shell"], family="'Comic Sans MS', cursive")
           + line(18, 58, 88, 42, 4, C["ink"]),
           'transform="translate(806 330) rotate(8)"')
    # polaroid of a yacht
    b += g(rect(0, 0, 96, 110, C["shell"], 4) + rect(10, 10, 76, 66, C["sky"], 3)
           + rect(10, 54, 76, 22, C["sea"], 0) + path("M24,58 L74,58 L66,68 L32,68 Z", C["shell"], 3) + path("M40,58 L46,40 L58,58", C["shell"], 3)
           + rect(10, 10, 76, 66, "none", 3),
           'transform="translate(790 70) rotate(12)"')
    # gold star sticker
    pts = []
    for k in range(10):
        a = math.radians(-90 + k * 36); r = 22 if k % 2 == 0 else 10
        pts.append((270 + math.cos(a) * r, 594 + math.sin(a) * r))
    b += poly(pts, C["gold_light"], 4)
    return svg(W, H, b, "Sell Me This Pen - CRT monitor (screen is a transparent hole)")


def monitor_glare():
    W, H = 700, 456
    b = path("M30,0 L190,0 L60,456 L0,456 L0,40 Z", "#ffffff", 0, extra='opacity="0.18"')
    b += path("M230,0 L270,0 L140,456 L100,456 Z", "#ffffff", 0, extra='opacity="0.12"')
    return svg(W, H, b, "Monitor glass glare overlay")


def bg_title():
    W, H = 1600, 900
    b = rect(0, 0, W, H, C["sky"], 0)
    # sky bands warming toward the horizon
    for y, col in ((260, "#cfe9f4"), (360, C["sky_pale"]), (440, "#ffe6c8"), (500, C["peach"])):
        b += rect(0, y, W, H - y, col, 0)
    # retro sun with cut stripes
    b += f'<clipPath id="sun"><circle cx="640" cy="600" r="240"/></clipPath>'
    sun = circ(640, 600, 240, C["gold_light"], 0) + rect(380, 560, 520, 200, C["gold"], 0)
    for k, y in enumerate((450, 492, 528, 560, 588)):
        sun += rect(380, y, 520, 6 + k * 3, C["peach"], 0)
    b += g(sun, 'clip-path="url(#sun)"') + circ(640, 600, 240, "none", 5)
    # ocean
    b += rect(0, 600, W, 300, C["sea"], 0) + line(0, 600, W, 600, 5)
    for k in range(7):
        b += line(640 - 160 + k * 14, 620 + k * 16, 640 + 160 - k * 14, 620 + k * 16, 6, C["gold_light"])
    for x, y in ((200, 640), (380, 680), (1150, 650), (1360, 690), (560, 720), (1020, 730)):
        b += line(x, y, x + 60, y, 4, C["sky_pale"])
    # tiny skyline both sides
    b += skyline(-40, 560, 620, "", 0.55)
    b += skyline(1040, 1640, 620, "", 0.55)
    # big palms framing
    b += palm_tree(150, 900, 700, 0.9, sw=5)
    b += palm_tree(1470, 900, 760, -0.9, sw=5)
    b += palm_tree(1350, 900, 520, -0.6, sw=5)
    # window frame verticals (low angle: lines converge up)
    for x0, x1 in ((340, 300), (1260, 1300)):
        b += poly([(x0 - 12, 900), (x0 + 12, 900), (x1 + 8, 0), (x1 - 8, 0)], C["shell"], 5)
    # peach drapes at the edges
    for side in (0, 1):
        x = 0 if side == 0 else W
        s = 1 if side == 0 else -1
        d = f"M{x},0 L{x+s*150},0 Q{x+s*110},300 {x+s*170},560 Q{x+s*120},760 {x+s*140},900 L{x},900 Z"
        b += path(d, C["blush"], 5)
        for k in (40, 85, 125):
            b += path(f"M{x+s*k},20 Q{x+s*(k-20)},400 {x+s*(k+10)},880", "none", 3.5, extra=f'stroke="{C["coral_light"]}"')
    # empty cream leather chair, turned slightly
    ch = ""
    ch += path("M640,430 Q640,360 720,356 L900,350 Q980,352 984,430 L992,700 L632,700 Z", C["sand_dim"], 6)
    ch += path("M672,450 Q672,400 730,396 L892,392 Q950,396 952,450 L958,690 L666,690 Z", C["cream"], 4)
    for r_ in range(3):
        for c_ in range(4):
            ch += circ(712 + c_ * 66 + (r_ % 2) * 33, 460 + r_ * 70, 6, C["beige_shadow"], 3)
    ch += path("M600,560 Q600,520 640,520 L660,700 L600,700 Z", C["sand_dim"], 5)
    ch += path("M1024,560 Q1024,520 984,520 L970,700 L1024,700 Z", C["sand_dim"], 5)
    b += g(ch, 'transform="translate(1110 700) scale(0.92) rotate(4) translate(-812 -700)"')
    # desk front (deco), heroic low angle
    b += poly([(300, 690), (1300, 690), (1360, 900), (240, 900)], C["wood"], 6)
    b += rect(270, 664, 1060, 40, C["wood_dark"], 6, rx=6)
    b += rect(270, 664, 1060, 10, C["gold_light"], 0)
    for x in (480, 800, 1120):
        b += path(f"M{x},720 L{x+40},770 L{x},820 L{x-40},770 Z", C["gold_light"], 4)
    for y in (850, 872):
        b += line(262, y, 1338, y, 4, C["gold"])
    return svg(W, H, b, "Sell Me This Pen - title screen background")


if __name__ == "__main__":
    write(OUT + "/backgrounds", "bg-desk.svg", bg_desk())
    write(OUT + "/backgrounds", "bg-title.svg", bg_title())
    write(OUT + "/props", "monitor.svg", monitor())
    write(OUT + "/props", "monitor-glare.svg", monitor_glare())
    print("ok")
