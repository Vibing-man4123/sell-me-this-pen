# Sell Me This Pen — Brief graficzny

> Lista assetów do zrobienia, pisana tak, żeby dało się ją **kopiować kawałkami** do Claude Design / Figmy / czegokolwiek innego.
> Założony: 2026-11-12. Towarzyszy `PLAN.md` (co zamierzamy) i `PROGRESS.md` (co zrobione).
>
> **Komentarze po polsku, briefy po angielsku** — tak jak reszta projektu: dokumenty po polsku, treść gry po angielsku. Narzędzia do grafiki też lepiej rozumieją angielski.

---

## Kierunek: Flash / Newgrounds, ok. 2003

Zmiana względem moodboardu z Fazy 0. Tamten projektował powściągliwy flat vector; idziemy w stronę głośnej, przerysowanej kreski z czasów Flasha.

**Co zostaje:** tekstury CSS (papier, sukno, winieta, złota folia), typografia, konstrukcja „jedna głowa, różnicowana dodatkami".
**Co się zmienia:** proporcje (przerysowane), mimika (wyolbrzymiona), grubość kreski (grubsza), nasycenie postaci (mocniejsze), chrom UI (fazowane guziki, cienie) — **oraz paleta: od 2026-11-12 jest to Miami Daylight**, jasny interfejs zamiast granatowego biura o 21:00. Patrz blok palety niżej.

**Czego świadomie NIE robimy:** gradientów na postaciach, blurów, tekstur rastrowych, fotorealizmu, „ładnego" minimalizmu. Ma być trochę toporne. To jest cecha, nie wada.

✅ Paleta jest już wdrożona w kodzie i na `/moodboard` — rysuj prosto pod nią, nic nie trzeba przeliczać.
⚠️ Ilustracje na moodboardzie to nadal stary zestaw przefarbowany na nowe kolory. Zastąpią je te, które powstaną z tego briefu.

---

## ‼️ Dwie rzeczy techniczne, bez których nie wkleję tego do gry

1. **SVG, nie PNG.** Obecna grafika to inline SVG w komponentach Reacta: ostra w każdej rozdzielczości, waży tyle co nic, kolory idą z tokenów. PNG będzie działać, ale stracimy skalowanie i przefarbowywanie. Jeśli narzędzie da wybór — SVG, płaskie kształty, bez filtrów i bez osadzonych bitmap.
2. **Przezroczyste tło** na wszystkim poza tłami (sekcja D). Postać z wklejonym prostokątem tła nie da się położyć na biurku.

---

## BLOK STYLU — wklejaj to przy **każdym** assecie

To jest najważniejszy fragment całego pliku. Trzydzieści assetów zrobionych bez wspólnego bloku stylu wygląda jak trzydzieści assetów od trzydziestu osób.

```
STYLE

Flash-era Newgrounds cartoon, circa 2003. Vector, not painterly.

LINE: uniform black outline (#141210), heavy - roughly 1.5% of canvas width.
Closed shapes. No sketchy strokes, no tapering, no texture in the line.
FILL: flat colour only. Per form, exactly one lighter shape for highlight
and one darker shape for shadow. No gradients on characters, no airbrush,
no blur, no grain.
SHAPE: exaggerated cartoon proportions - oversized head, small body, large
expressive hands, rubbery limbs. The silhouette must still read at 20% size.
FACE: push the expression hard. Eyes do most of the work. Sweat beads,
gritted teeth, bulging veins and extreme eyebrow angles are all encouraged.
TONE: parody of a 1980s/90s hard-sell stockbroker world. Funny, a little
crude, never mean-spirited, never photoreal. Slightly janky is correct.
BACKGROUND: fully transparent, unless the asset is itself a background.
FORMAT: SVG. Flat colour shapes only. No embedded raster, no filter effects.
```

---

## BLOK PALETY — wklejaj razem z blokiem stylu

Paleta **Miami Daylight**, zatwierdzona 2026-11-12. Wszystkie wartości są już wdrożone w kodzie gry i widoczne na `/moodboard` — to nie jest propozycja, tylko stan faktyczny. Każda para tekst/tło przechodzi kontrast WCAG AA.

```
PALETTE - Miami Daylight. Use these, plus pure black and white. Nothing else.

This is a BRIGHT, daylight palette. Mid-1980s Miami: art deco, sun, chrome
and bad money. The interface is light, not dark.

GROUND AND SURFACES:
  sky        #bfe3f2   the world behind everything - afternoon sky
  sky-pale   #e3f3fb   raised surfaces, the client's speech bubble
  sky-deep   #3a9bc9   deeper water blue, shadows under buttons
  shell      #ffffff   clean white panels
  sand       #fdf4e6   paper, documents, the broker's speech bubble
  sand-dim   #f1e2c9   paper in shadow

LINE AND TEXT:
  ink        #22364a   EVERY outline, and all primary text. Not black.
  ink-soft   #4b6375   secondary text
  ink-faint  #5f7384   captions

METAL AND MONEY:
  brass      #98662b   deco trim, hardware, hairlines
  gold       #f0922f   golden orange - primary action, money, the good stuff
  gold-light #ffc061   highlight on gold

HEAT AND GREEN:
  coral      #d91d40   warnings, hang-ups, score bars
  coral-light#ff7d93   highlight on coral
  palm       #297d64   palm green, success, the desk pad
  dialtone   #117d68   RESERVED: the live-call indicator and nothing else

CHARACTERS (louder - Flash cartoons need saturation the UI does not):
  skin-light  #f6c9a0
  skin-mid    #d79a6a
  skin-deep   #8d5524
  hot-pink    #ff5f9e   Miami pink - signage, lips, bad blazers
  hot-cyan    #2ec5d9   pastel deco cyan
  hot-yellow  #ffd23f   loud suits, bleached hair
  hot-purple  #8f5bc4   bad fashion decisions
  lime        #9ed64f   crypto, wellness drinks, dollar-sign eyes

IMPORTANT: outlines are ink (#22364a), never pure black. On a bright palette
pure black outlines go muddy and heavy.
Shade any colour with a 15% darker version of the same hue. Never with black.
```

# A. POSTACIE

Najwyższy priorytet. Portrety to najlepszy asset w projekcie, a na ekranie rozmowy są dziś ściśnięte do 44 px.

**Dla każdej postaci potrzebuję 3 wyrazów twarzy** — gra wie, jak idzie rozmowa (opór / zmiękczenie / zamknięcie), więc twarz może na to reagować. To jest ta jedna rzecz, która najmocniej zrobi „wczucie" za najmniej roboty.

```
CANVAS: 512 x 512, square, transparent.
CROP: head and shoulders. Head fills about 70% of the frame.
DELIVER 3 VARIANTS of the same character, identical construction,
changing only the face:
  _neutral  - guarded, mid-sentence, unimpressed
  _resist   - the objection face: sceptical, annoyed, arms-up energy
  _sold     - the fold: delighted, won over, slightly embarrassed about it
Keep hair, clothing, props and colours pixel-identical across the three.
```

---

### A1 — Jordan Beltford (gracz) ⭐ PIERWSZY DO ZROBIENIA

Nie istnieje. Ekran tytułowy o nim mówi, a nie ma go nigdzie. To twarz gry.

```
Jordan Beltford, the player character. A parody 1990s stockbroker.
Male, early 30s, aggressively confident, no visible licence to do any of this.

Too much hair gel - hair sculpted into a shiny helmet, comb lines visible
as drawn shapes, not shading. Oversized boxy double-breasted suit with
massive shoulder pads. Loud tie, far too wide, hot-red or hot-yellow.
Collar too big for his neck. A watch that is too large and too gold.
Permanent salesman's grin that does not reach the eyes. Teeth very white,
drawn as one clean shape.

He is the funniest thing on screen. Lean hard into the caricature.

Variants here are different: _grin (default), _panic (sweating, tie askew,
eyes wide), _rich (sunglasses, cigar, dollar signs for pupils).
```

---

### A2 — Dr. Brenda Kalb · dentystka · trudność ×1.0

```
Dr. Brenda Kalb, 52, suburban dentist. Difficulty 1 of 3 - the easy call.

Friendly, chatty, genuinely nice, permanently distracted. Owns a comfortable
practice and a boat she never uses. Terrified of looking foolish in front of
her own staff.

Pale blue dental scrubs, outline-heavy. Reading glasses pushed up into
sensible shoulder-length hair. A paper face mask pulled down under her chin,
never over her mouth. Holds a dental mirror or pokey metal tool in one hand
even while on the phone.

_neutral - polite, already looking at something off-frame
_resist  - apologetic grimace, glancing over her shoulder, "I have someone
           numb in room two" energy
_sold    - thrilled, mask forgotten, genuinely pleased with herself
```

### A3 — Kai Mercer · krypto-chłopak · ×1.4

```
Kai Mercer, 28, claims to be "between liquidity events". Difficulty 1.4.

Massively overconfident, allergic to boring detail, desperate to be the guy
who got in early. Lives with three roommates and a ring light.

Hoodie or an open blazer worn over a graphic tee - the blazer is the joke.
Backwards cap or a very deliberate haircut. AirPods in, always, even on a
landline call. Phone in hand showing a green line going up. Faint ring-light
circle reflected in his eyes.

_neutral - mid-pitch about his own startup, not listening
_resist  - counter-pitching, hands up in a "let me cook" gesture
_sold    - sick-green dollar signs in his eyes, pure FOMO ecstasy
```

### A4 — Eunice Pell · 81 lat, samotna i przebiegła · ×1.8

```
Eunice Pell, 81, widowed. Difficulty 1.8. Delighted someone called.
Has been pitched by professionals for forty years and remembers every one.

Warm and grandmotherly at first glance, with eyes that are much too sharp.
That contrast is the whole character - draw her kind, light her shrewd.

Tight white perm. Cardigan with an enormous floral brooch. Enormous
spectacles. Corded avocado-green rotary phone handset held in both hands.
A framed photo of her late husband Walter visible at the edge of frame.
Doilies if there is room.

_neutral - sweet, patient, settling in for a very long conversation
_resist  - one eyebrow up, utterly unbothered, running out your clock
_sold    - genuine delight, but only for a small and specific amount
```

### A5 — Dale Hochstetter · CFO · ×2.3

```
Dale Hochstetter, 58, CFO of a mid-size trucking company. Difficulty 2.3.
Thirty years of being pitched. Blunt, numerate, mildly contemptuous.
Respects competence and nothing else. Treats enthusiasm as evidence of fraud.

Heavy-set, square jaw, grey crew cut. Short-sleeved dress shirt with a
cheap tie. Reading glasses low on the nose, looking over them, never
through them. Thick forearms. A desk calculator or printed spreadsheet in
shot. Deep unimpressed frown lines drawn as actual black shapes.

_neutral - already bored, already checking the time
_resist  - leaning in, finger pointed at camera, "what's the number"
_sold    - not a smile. A single approving nod and a raised eyebrow.
           He respects you now. That is the entire reward.
```

### A6 — Saffron Vey · influencerka wellness · ×2.4

```
Saffron Vey, 31, wellness influencer with 400k followers and her own
supplement line. Difficulty 2.4. Not stupid - genuinely uninterested in
anything that is not about her brand.

Beige-on-beige athleisure, immaculate. Long beachy hair. Holding a green
smoothie in a glass jar at all times. A second phone on a tripod pointed at
her, because she might be filming this. Crystal necklace. Serene expression
that is doing a lot of work.

Palette: push cream/sage here rather than the loud hots - her whole brand
is "clean", and the restraint is the joke.

_neutral - serene, head tilted, performing listening
_resist  - hand up, polite refusal face, "I'm very protective of my community"
_sold    - lit up, already composing the caption about it
```

### A7 — Gil Orloff · bunkrowiec · ×3.0

```
Gil Orloff, 64, bunker enthusiast. Difficulty 3 of 3 - the hardest call.
Sitting on a surprising amount of cash and a surprising amount of canned
peaches. Deeply suspicious, well-read in the wrong directions, lonely
enough to stay on the line. Convinced you are a federal agent.

Wild grey beard. Surplus military jacket over a vest. Trucker cap.
Squinting with deep suspicion. Harsh overhead bunker lighting implied by strong contrast on one side of
the face only - but still as flat shapes, no blur. He is the one character
who is not in the sunshine, and that is the joke.
Shelves of canned peaches behind him. A corded phone with the cord stretched
very far. Optional: a hand-drawn conspiracy map pinned up behind.

_neutral - squinting, suspicious, silent
_resist  - pointing accusingly at camera, mouth mid-interrogation
_sold    - still suspicious, but nodding slowly. He bought more than you
           asked him to and he will not explain why.
```

---

# B. TOWAR

Ikony towaru. Styl ma sprzedawać żart — każdy przedmiot ma „haczyk", który gracz musi obgadać, i ten haczyk powinien być widoczny na ilustracji.

```
CANVAS: 256 x 256, square, transparent.
Single object, centred, filling about 80% of the frame.
Same heavy outline and flat fill as the characters.
Slight 3/4 tilt reads better than dead-on.
Each one is a prop in a joke - make the joke visible in the drawing.
```

| # | Asset | Brief do wklejenia |
|---|---|---|
| B1 | `item-pen` | `An utterly ordinary blue ballpoint pen. Cheap, plastic, slightly chewed cap. The comedy is that it is presented like a luxury item: give it a tiny velvet cushion and a single gold sparkle it has not earned.` |
| B2 | `item-timeshare` | `A sad condo unit in Scranton. Brown brick, small window, a balcony the size of a doormat. Snow on the roof and a swimming pool below it with a "SEASONALLY CLOSED" sign and no water. Grey sky.` |
| B3 | `item-moon` | `A framed deed to one acre of the Moon. Laminated printer paper in a cheap gold plastic frame, a wax seal that is obviously a sticker, a crude moon drawing and far too much certificate scrollwork. One corner already peeling.` |
| B4 | `item-ostrich` | `An ostrich in a business setting, drawn with total seriousness. Alarmed eyes, absurd neck. Optionally standing on a tiny stock-chart plinth with a line going up. The bird has not been independently verified and it knows it.` |
| B5 | `item-vowel` | `The letter E as a physical object - a big, heavy, gold three-dimensional letter E on a marble trophy base, with a small engraved plaque. Treat it like a prestigious award for something that cannot be owned.` |
| B6 | `item-condo` | `A beachfront condo with no beach - the building sits on an eroded sandy cliff dropping straight into water. Ocean view, yes. Three small friendly cartoon ghosts in different windows. "MOTIVATED SELLER" sign out front, slightly crooked.` |

---

# C. TELEFON ⭐ DRUGI DO ZROBIENIA

To jest centralny rekwizyt całej gry i nie istnieje. Ekran rozmowy wygląda dziś jak zwykły czat właśnie dlatego, że nie ma na nim telefonu.

```
CANVAS: 600 x 500, transparent.

A 1980s office desk phone, seen at a 3/4 angle from slightly above.
Chunky beige-and-brass body, heavy square push-buttons, coiled cord.
Built like a brick. Brass (#98662b) fittings, sand (#fdf4e6) body,
ink outlines (#22364a). It should look heavy enough to hurt someone.

DELIVER 3 STATES, identical body, cord and angle:
  phone_idle    - handset resting in the cradle, cord hanging slack
  phone_ringing - handset in cradle, lifting very slightly, motion arcs
                  either side, cord jumping. Classic Flash shake lines.
  phone_live    - handset lifted off the cradle and hanging by its cord,
                  cord stretched taut toward the left of frame

Also deliver phone_handset on its own, 400 x 400, for use as a small icon.
```

---

# D. TŁA

```
CANVAS: 1600 x 900.
Backgrounds are the only assets that are NOT transparent.
Keep the centre 60% visually calm - UI panels sit on top of it and
text must stay readable. Put the detail around the edges.
Flat shapes only. Suggest depth with overlapping and value, never blur.
```

### D1 — Biurko (ekran rozmowy) ⭐ TRZECI DO ZROBIENIA

```
A stockbroker's desk in Miami, late afternoon, seen from the broker's own
chair looking down and slightly forward. First-person - we never see the
player's body.

Green felt desk pad (#297d64) filling the lower two thirds, with a worn
leather edge. Scattered on it: a rolodex, a coffee ring stain, a half-eaten
sandwich, loose paper (#fdf4e6), a cigar in a glass ashtray, a brass desk
lamp that is switched off because it is daylight.

Behind and above: a wide window filling the wall, bright sky (#bfe3f2),
two or three palm trees, a sliver of ocean, pastel art-deco buildings in
sand and hot-pink. A wall clock reading just past four.

Everything slightly too cluttered. This man is not well, but the weather
is lovely.
```

### D2 — Ekran tytułowy

```
Same office, pulled back and heroic. Low angle looking up at the desk and
the huge window behind it: palms, ocean, deco skyline, sun low and golden.
Empty leather chair, waiting, turned slightly toward us.
Leave the upper third clear and uncluttered - the logo goes there.
```

---

# E. LOGO

```
CANVAS: 1200 x 600, transparent.

Wordmark: "SELL ME THIS PEN", stacked on two lines - "SELL ME" over
"THIS PEN".

Heavy condensed display letterforms with a thick ink outline (#22364a) and
a chunky offset drop shadow in hot-pink (#ff5f9e). Gold foil fill running
from #ffc061 down to #f0922f. Slight upward arc, confident and tacky. A hard white
specular streak across the upper third of the letters.

An actual pen may cross the wordmark diagonally like a sword.

This is a Flash game title card from 2003 and it should be unashamed.

Also deliver a 512 x 512 square version for the browser tab icon, legible
at 32px - likely just a gold pen on a sky-blue circle.
```

---

# F. RANGI (Faza 2)

```
CANVAS: 256 x 256, transparent. A badge or emblem, not a scene.
Heavy outline, flat fill, chunky bevel. Each should feel like a cheap
award that someone is nonetheless very proud of.
```

| Ranga | Próg | Brief |
|---|---|---|
| `rank-intern` | $0 | `A folding table with one wobbly leg and a paper nameplate taped to it. Rendered as a proud emblem, which is the joke. Dull brass (#98662b).` |
| `rank-junior` | $2.5k | `A desk phone and an office chair crossed like heraldic swords. Brass (#98662b) with a thin gold edge.` |
| `rank-shark` | $15k | `A shark in a suit jacket and tie, head and shoulders, grinning. Coral (#d91d40) and brass.` |
| `rank-wolf` | $60k | `A wolf head howling, wearing sunglasses, with a telephone handset clenched in its teeth. Gold.` |
| `rank-legend` | $250k | `A gold bust of Jordan Beltford on a marble plinth, laurel wreath, one gleam. Absurdly overblown. Full gold with gold-light highlights.` |

---

# G. LIFESTYLE SHOP (Faza 2)

Zakupy czysto kosmetyczne, zero wpływu na mechanikę. Każdy ma dwa stany, bo sklep musi pokazywać, czego jeszcze nie masz.

```
CANVAS: 320 x 320, transparent. Single object, 3/4 angle, catalogue style.
DELIVER 2 VARIANTS of each:
  _owned  - full colour
  _locked - the same shape in flat sky-deep (#3a9bc9) silhouette with the
            standard ink outline, no interior detail
```

```
shop-suit      A double-breasted pinstripe suit on a hanger, shoulders far
               too wide, with a loud contrast tie.
shop-watch     An enormous gold wristwatch, more face than wrist, with
               visible sparkle marks.
shop-cigar     A fat cigar in a cut-glass ashtray, lit, one curl of smoke
               drawn as a flat shape.
shop-car       A low red 1980s sports car, 3/4 front, pop-up headlights,
               absurdly wide rear tyres.
shop-office    A corner office as a tiny diorama: huge desk, leather chair,
               two windows, a globe nobody uses.
shop-yacht     A white yacht, side on, far too many decks for its length,
               tiny flag.
shop-chopper   A helicopter, because at some point the yacht is not enough.
```

---

# H. CHROM UI I „JUICE" (niższy priorytet)

To już jest wisienka. Robić dopiero, gdy A–E stoją.

```
CANVAS: as noted. Transparent.

ui-button-set   600 x 200. A chunky Flash-era button in three states:
                rest, hover, pressed. Thick ink outline, hard bevel, a
                flat white gloss shape across the top half, offset drop
                shadow. Gold (#f0922f) primary and white/sky secondary versions.

ui-bubble-set   800 x 400. Two speech bubble shapes with pointed tails:
                one in sand (#fdf4e6) for the broker, one in sky-pale
                (#e3f3fb) for the client. Hand-drawn wobble in the outline, not
                perfect geometry.

ui-frame        900 x 600. An ornate panel frame - brass corners, a thin
                double rule, slightly uneven. Must work as a 9-slice
                (corners fixed, edges repeatable).

fx-sold-stamp   400 x 300. A "SOLD!" rubber stamp in coral (#d91d40), rotated
                about 15 degrees, with ink bleed and gaps - as if stamped
                badly on paper.

fx-cash-burst   400 x 400. A burst of dollar bills and gold coins flying
                outward, for the moment a deal closes.

fx-sweat        200 x 200. Three classic cartoon sweat droplets, for when
                a call is going badly.

fx-dialtone     400 x 100. Three or four concentric sound-wave arcs in
                dialtone green (#117d68), to sit beside the live-call
                indicator.
```

---

# Kolejność, w jakiej bym to robił

Nie rób wszystkiego naraz. Po każdej grupie mogę wkleić efekty do gry i zobaczysz realną różnicę — a Ty zobaczysz, czy kierunek się zgadza, zanim zrobisz trzydzieści assetów w złym stylu.

| Tura | Co | Po co |
|---|---|---|
| **1** | A1 Jordan + A2 Brenda (3 miny) + C telefon | Test kierunku na najmniejszej możliwej próbce. Brenda to pierwsza rozmowa w grze, Jordan to twarz gry, telefon to centralny rekwizyt. **Zacznij od tego i pokaż mi, zanim pójdziesz dalej.** |
| **2** | D1 biurko + E logo | Po tym ekran rozmowy i tytułowy przestają wyglądać jak czat |
| **3** | A3–A7 pozostałe persony | Największa pojedyncza porcja roboty |
| **4** | B1–B6 towar | |
| **5** | F rangi + G sklep | Dopiero gdy Faza 2 wie, jak te ekrany wyglądają |
| **6** | H chrom i juice | Wisienka |

**Po turze 1 zatrzymaj się i pokaż mi.** Jeśli kierunek siądzie, reszta pójdzie szybko. Jeśli nie — straciłeś trzy assety, nie trzydzieści.

---

## Czego mi NIE trzeba

Żeby nie robić roboty do kosza:

- **Animacji.** Ruch zrobimy w CSS na gotowych kształtach (trzęsący się telefon, pulsujący wskaźnik). Klatki animacji to zmarnowany czas.
- **Wariantów kolorystycznych.** Kolory idą z tokenów — jeśli asset jest w SVG, przefarbuję go sam.
- **Ikonek UI** (strzałki, krzyżyki, hamburgery). To robię w kodzie, szybciej i ostrzej.
- **Dźwięku.** Osobny temat, poza tym plikiem.
- **Tła pod sklep i Rolodex** — te ekrany jeszcze nie istnieją, więc nie wiemy, czego potrzebują.
