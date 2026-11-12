# Sell Me This Pen — Dziennik postępów

> Plik prowadzony równolegle do `PLAN.md`. `PLAN.md` = co zamierzamy, `PROGRESS.md` = co faktycznie zrobione i jak stoimy z czasem.

**Start projektu:** 2026-11-08
**Ostatnia aktualizacja:** 2026-11-12
**Live:** https://sellmethispen.vercel.app

---

## Status timeline'u

| Faza | Zakres | Budżet z planu | Planowany koniec | Status |
|---|---|---|---|---|
| **0** | Setup & design | 2–3 dni | 2026-11-10 | ✅ **ZAMKNIĘTA** 2026-11-09 |
| **1** | Core call loop (MVP) | ~1 tydzień | 2026-11-17 | ✅ **ZAMKNIĘTA** 2026-11-11 |
| 2 | Progression system | ~1 tydzień | 2026-11-24 | ⚪ Nie zaczęte |
| 3 | Humor & polish treści | ~1 tydzień | 2026-12-01 | ⚪ Nie zaczęte |
| 4 | Classroom-ready polish | 3–5 dni | 2026-12-06 | ⚪ Nie zaczęte |

**Jak się trzymamy:** mocno przed harmonogramem. Faza 1 miała budżet tygodnia (do 17.11), zamknięta w jednej sesji 11.11 — **6 dni zapasu**. Pomogło to, że Faza 0 zostawiła gotowe prompty, rubric i ekonomię: cała ta sesja poszła na hydraulikę i UI, nie na projektowanie. Gra jest od dziś **grywalna od początku do końca**: dzwonisz, rozmawiasz, dostajesz ocenę i kasę. Realistyczny termin pełnego MVP: **koniec listopada 2026**.

Legenda: 🟢 zrobione · 🟡 w trakcie · 🔴 zablokowane · ⚪ nie zaczęte

---

## FAZA 0 — Setup & design

### ✅ Scaffold projektu
- Next.js **16.4.5** (App Router, Turbopack) + TypeScript + Tailwind CSS **4** + ESLint
- Zustand 5 (state na Fazę 2) i Zod 4 (walidacja structured output) zainstalowane
- `npm run build` i `npx eslint .` przechodzą czysto
- Usunięte domyślne assety startera, `.env.example` z miejscem na klucz Groq

### ✅ Schemat oceny (JSON rubric) — `src/lib/game/rubric.ts`
To serce gry — stąd bierze się kasa, więc wszystko siedzi w jednym pliku.

- **4 kryteria z wagami:** Charisma 20% · Confidence 20% · **Objection Handling 35%** · Closing 25%
  (obsługa obiekcji waży najwięcej, bo to jedyna naprawdę trudna część rozmowy)
- Każde kryterium ma **4 kotwice opisowe** (0 / 3 / 6 / 9) — żeby model nie zgadywał, tylko porównywał do konkretnych opisów
- Sędzia zwraca też: `closedDeal`, `unitsSold`, `bestLine` i `worstLine` (**dosłowne cytaty** z transkryptu) oraz `coaching` — feedback pisany jako obleśny menedżer sprzedaży z lat 90'
- Schemat zdefiniowany raz w Zodzie, JSON Schema dla LLM **generowany automatycznie** (`z.toJSONSchema`) — nie da się ich rozjechać
- Guard przy imporcie: jeśli wagi przestaną się sumować do 1, aplikacja wywala się od razu, a nie po cichu psuje ekonomię

### ✅ Przelicznik kasy — `src/lib/game/payout.ts`
- `commission = baseCommission × difficulty × rate`, gdzie `rate` zależy od wyniku, zamknięcia i liczby sztuk
- Udana sprzedaż: 30% prowizji gwarantowane + 70% skalowane wynikiem; wielokrotna sprzedaż daje bonus +35%/szt. (cap ×3)
- Nieudana: 6% prowizji × wynik — „na benzynę", żeby dobra rozmowa bez zamknięcia nie bolała zbyt mocno
- Funkcja zwraca **pełny rozkład obliczeń**, więc ekran wyniku pokazuje graczowi dokładnie skąd wzięła się kwota

### ✅ Struktura promptów person — `src/lib/prompts/`
- **`clientPrompt.ts`** — klient AI. Dwie reguły robią najwięcej roboty: klient *nigdy* nie proponuje zakupu sam, i mięknie *tylko* wtedy, gdy gracz trafi w jego konkretną słabość. Bez tego modele zamykają deal z grzeczności i ocena przestaje cokolwiek znaczyć.
  - Tokeny sterujące: `[CLOSED]` (zgoda) i `[HANGUP]` (rozłączenie) — koniec rozmowy wykrywany bez zgadywania
  - Limity: 1–3 zdania na odpowiedź, max 12 wymian, 220 tokenów — żeby śmigało na szkolnych Chromebookach
- **`judgePrompt.ts`** — sędzia. Rubric renderowany z danych + **3 przykłady kalibracyjne** (niski / średni / wysoki) z uzasadnieniem. To bezpośrednia odpowiedź na ryzyko nr 1 z planu („oceny skaczą losowo") — przykłady kotwiczą skalę.

### ✅ Treść: 6 person i 6 przedmiotów
Plan zakładał to dopiero w Fazie 2–3, ale bez tego nie dało się sensownie zaprojektować stylu.

**Klienci** (każdy ma: osobowość, sposób stawiania oporu, tiki językowe, ukrytą słabość, mnożnik trudności):
| Persona | Kto to | Trudność |
|---|---|---|
| Dr. Brenda Kalb | dentystka z przedmieścia, ucieka przez „jestem zajęta" | ×1.0 |
| Kai Mercer | krypto-chłopak, kupi wszystko, zapłaci niczym | ×1.4 |
| Eunice Pell | 81 lat, samotna i przebiegła — przegada Cię | ×1.8 |
| Dale Hochstetter | CFO, atakuje liczby w 30 sekund | ×2.3 |
| Saffron Vey | influencerka wellness, wszystko sprowadza do siebie | ×2.4 |
| Gil Orloff | preppers z bunkra, uważa Cię za agenta federalnego | ×3.0 |

**Towar** (każdy ma cenę, prowizję bazową i „haczyk", który gracz musi obgadać):
Długopis · Timeshare w Scranton · Akr Księżyca · Kontrakty terminowe na strusie · Prawa do litery „E" · Nawiedzony apartament przy plaży

**Drabinka rang:** Intern → Junior Broker ($2.5k) → Shark ($15k) → Wolf ($60k) → Legend ($250k).
Rangi odblokowują treść i **nic więcej** — zero mnożników do kasy, żeby progresja została czytelna.

### ✅ Moodboard / styl graficzny — strona `/moodboard`
Zamiast pliku w Figmie zrobiony jako **żywa strona w repo** — nie rozjedzie się z kodem, bo renderuje się z tych samych danych co gra.

- **Paleta (13 tokenów):** „biuro maklerskie o 21:00" — granaty, zieleń sukna, oksblood, mosiądz, złoto, papier. Plus jeden kolor (`dialtone`) zarezerwowany wyłącznie na wskaźnik trwającej rozmowy.
- **Typografia:** Playfair Display (nagłówki, kasa) · Inter (dialogi) · IBM Plex Mono (liczby, etykiety)
- **Tekstury proceduralne w CSS** (ziarno papieru, sukno, winieta, złota folia) — zero plików graficznych, bo szkolne Chromebooki
- **Ilustracje — Opcja A z planu, rysowane ręcznie w SVG:** płaski wektor, obrys 3px, zero gradientów. Jedna wspólna konstrukcja głowy, różnicowana tylko przez włosy / ubranie / wyraz twarzy / rekwizyty — dlatego 6 twarzy wygląda jakby rysowała je jedna osoba, a siódma to kwestia jednego wpisu w konfigu. Do tego 6 ikon towaru w tym samym stylu.
- Rubric i przykładowe wyliczenie prowizji renderują się **na żywo z kodu gry** — moodboard jest jednocześnie testem, że ekonomia się spina

### ✅ Ekran tytułowy — `/`
Szkielet: tytuł w złotej folii, pitch, galeria 6 person, pętla rozgrywki, drabinka rang, disclaimer prawny.

### ✅ Tytuł i struktura repo (2026-11-09)
- **Tytuł gry: „Sell Me This Pen"**. Robi podwójną robotę — jest nazwą i jednocześnie samouczkiem, bo każdy od razu wie o co chodzi. Pierwszy przedmiot w Rolodexie to „The Pen", więc gra dosłownie otwiera się swoim tytułem. Odrzucone: „Coke Call" (zabija użycie w szkole + kolizja ze znakiem Coca-Coli), „The Salesman" (nie do wyszukania przez *Death of a Salesman* i film Farhadiego z 2016), „Dial Tone Dynasty" (abstrakcyjny, nic w nim nie śmieszy).
- Tytuł siedzi w jednej stałej (`GAME_TITLE` w `constants.ts`), więc kolejna zmiana nazwy to edycja jednej linijki.
- **Aplikacja przeniesiona do `cold/`**, `PLAN.md` i `PROGRESS.md` zostają w korzeniu repo. Historia gita zachowana (`git mv`). Build i lint przechodzą z nowej lokalizacji.

### ✅ Ikona aplikacji (2026-11-09)
Domyślny favicon Next.js zastąpiony własnym (`src/app/icon.svg`) — złoty długopis na granacie, ten sam obrys co reszta zestawu wektorowego. Sprawdzona czytelność przy 32px, bo tyle realnie renderuje karta przeglądarki.

### ✅ Deploy na Vercel (2026-11-09)
- **Produkcja: https://sellmethispen.vercel.app** — status Ready, build 12–30 s, obie strony (`/` i `/moodboard`) zwracają 200
- Root Directory ustawiony na `cold` — zadziałało
- Zweryfikowane na żywo: tytuł, 6 portretów, 6 ikon, rubric, wyliczenie prowizji, własna ikona. Strona waży 73 KB HTML i ładuje się w ~0.34 s — z zapasem pod szkolne Chromebooki.
- Zmienne środowiskowe: na tym etapie żadne nie były potrzebne (Groq doszedł w Fazie 1)

**Adresy:** projekt nazywa się `sell-me-this-pen`, produkcja stoi pod **sellmethispen.vercel.app**. Uwaga na pułapkę: przestrzeń `*.vercel.app` jest globalna i pierwszy bierze — `sell-me-this-pen.vercel.app` było już zajęte przez cudzy projekt, dlatego alias jest bez myślników. Wersje z myślnikami NIE są nasze. Stare adresy `cold-roan` i `cold-rodion16` też dalej prowadzą do gry.

---

## FAZA 1 — Core call loop (MVP) *(2026-11-11)*

Od tej sesji **gra jest grywalna**: `/` → „Pick up the phone" → rozmowa → ocena → prowizja.

### ✅ Proxy do Groq — `src/lib/server/groq.ts`
Klucz API żyje wyłącznie w route handlerach, przeglądarka gada tylko z naszym serwerem. Zamiast SDK ręczny `fetch` — używamy jednego endpointu, a dzięki temu taksonomia błędów jest nasza, nie biblioteki: `missing_key` / `rate_limit` / `timeout` / `upstream` / `bad_output`, każdy z flagą `retryable`. Timeout 20 s.

### ✅ `POST /api/call` — jedna wymiana rozmowy
- Walidacja Zodem, nieznana persona/przedmiot = 400
- Tokeny `[CLOSED]` / `[HANGUP]` wycinane **po stronie serwera** — do przeglądarki nigdy nie trafiają
- Limit 12 tur pilnowany na serwerze; na ostatniej turze model dostaje cichą instrukcję domknięcia rozmowy, żeby nie urywała się w pół zdania
- Pusta odpowiedź modelu traktowana jak błąd, nie jak milczenie klienta

### ✅ `POST /api/judge` — ocena i wypłata
- Structured output przez `json_schema` ze `strict: true` (Groq pilnuje schematu po swojej stronie)
- Dodatkowo walidacja Zodem tego, czego schemat nie złapie, **plus kontrola czy `bestLine`/`worstLine` to naprawdę cytaty** z wypowiedzi gracza — jeden retry z konkretną reklamacją
- Wypłata liczona na serwerze, żeby kwota miała jedno źródło prawdy (Faza 2 będzie ją zapisywać)

### ✅ UI rozmowy — `/call/[personaId]/[itemId]`
Trasa jest sparametryzowana od razu, więc Rolodex w Fazie 2 tylko do niej podlinkuje. Wszystkie 36 kombinacji prerenderowane (`generateStaticParams`).
- Nagłówek: portret, trudność, towar z ceną, licznik tur, wskaźnik „ON THE LINE" w kolorze `dialtone`
- Dymki: klient po lewej za portretem, gracz po prawej na papierze biurowym
- **Efekt maszyny do pisania** zamiast streamingu z Groq — pełna odpowiedź przychodzi, tokeny są już wycięte, dopiero potem leci litera po literze. Dzięki temu `[CLOSED]` nie ma jak mignąć na ekranie. Respektuje `prefers-reduced-motion`, da się kliknąć i pominąć.
- Ekran wyniku: 4 paski, cytaty, coaching menedżera, pełna arytmetyka prowizji
- `error.tsx` jako ostatnia linia obrony — wyjątek w UI nie daje białego ekranu

### ✅ Friendly errors (zweryfikowane na żywo)
Każdy błąd ma tekst w tonie gry: rate limit to „The market just crashed", padnięta sieć to „Something chewed through the cable in the stairwell again". Techniczny szczegół pokazuje się **tylko** przy błędzie konfiguracji — czyli wtedy, gdy człowiek faktycznie musi coś naprawić. Przy błędach nieodwracalnych nie ma przycisku „Redial", żeby nie kazać graczowi klikać w ścianę.

---

## Pułapki i odkrycia z Fazy 1

**1. Model z `.env` już nie istniał.** `llama-3.3-70b-versatile` został wycofany z Groq — pierwsze zapytanie dostało 404. Konto ma dziś 11 modeli. Po testach:
- **Klient: `qwen/qwen3.8-27b`** — 0.13–0.6 s, trzyma charakter, zero narzutu na rozumowanie
- **Sędzia: `openai/gpt-oss-120b`** — model rozumujący, oceny dobrze skalibrowane (trafił w nasze przykłady kalibracyjne z Fazy 0)
- ⚠️ **`gpt-oss-20b` z limitem 220 tokenów zwrócił pusty string** — przepalił cały budżet na reasoning. Stąd zasada w kodzie: klient nie może być modelem rozumującym, a sędzia dostaje 2500 tokenów zapasu.

**2. Limity Groq są PER MODEL — i to zmienia kalkulację.** Zmierzone: **1000 zapytań/dobę i 8000 tokenów/minutę, osobno dla każdego modelu.** Rozdzielenie klienta i sędziego na dwa różne modele (zrobione w Fazie 0 z zupełnie innego powodu) **podwaja realny zapas**. Ale 8000 TPM to i tak mało: jedna pełna 12-turowa rozmowa to ~13k tokenów, bo historia leci z każdą turą od nowa. Dla jednego gracza OK (człowiek pisze wolno), **dla klasy na jednym kluczu — nie**. To jest teraz **ryzyko nr 1 na Fazę 4**, z konkretnymi liczbami zamiast przeczucia.

**3. Klient nie zawsze emituje token — i to kosztowało $791.** Model potrafi zgodzić się słowami („I'll take two acres, send me the invoice") albo się pożegnać („Goodbye.") **bez** `[CLOSED]`/`[HANGUP]`. Wzmocnienie reguły w promptcie pomogło przy rozłączeniu, ale nie wyleczyło zamykania deala. Ponieważ wynik tokena nadpisywał werdykt sędziego, realnie zamknięta sprzedaż wypłacała 6% „na benzynę". Zmierzone na żywym przykładzie: **$29 zamiast $820**.
→ **Rozwiązanie:** token wygrywa, gdy padnie (deterministycznie, zgodnie z decyzją z Fazy 0), ale gdy rozmowa skończyła się bez tokena, o `closedDeal` decyduje sędzia czytający transkrypt. Niedeterminizm wpuszczony dokładnie tam, gdzie alternatywą było bycie definitywnie w błędzie.

**4. Ekran wyniku pokazywał arytmetykę, która się nie zgadzała.** Wyświetlaliśmy `scoreFactor` (0.60), a wzór stosuje krzywą z gwarantowanym progiem: `0.3 + 0.7 × score`. Gracz widział `$220 × 1.0 × 0.60 × 1.35`, co daje $178, a dostawał $210. Przy zasadzie „wypłata, którą da się prześledzić" to nie kosmetyka, tylko złamanie obietnicy. Payout zwraca teraz `rate` i `exact`, a ekran pokazuje działanie, które **naprawdę** mnoży się do kwoty, razem z krokiem zaokrąglenia.

**5. `dynamicParams` nie współpracuje z `cacheComponents`.** Build wywala się wprost. Nieznane kombinacje w ścieżce łapie `notFound()` w komponencie i to wystarcza.

**6. ESLint w tym projekcie pilnuje `setState` w efektach.** Maszyna do pisania przeszła na stan wyliczany w renderze + `useSyncExternalStore` do `prefers-reduced-motion`. Wyszło krócej niż pierwsza wersja.

---

## Decyzje z Fazy 1

| Data | Decyzja | Dlaczego |
|---|---|---|
| 2026-11-11 | Brak streamingu z Groq; maszyna do pisania po stronie klienta | Tokeny `[CLOSED]`/`[HANGUP]` są wycinane zanim cokolwiek zobaczy gracz. Przy 0.3 s odpowiedzi streaming nic nie kupuje, a ryzykuje mignięciem tokena. |
| 2026-11-11 | Rozdzielone modele: szybki dla klienta, rozumujący dla sędziego | Latencja tam, gdzie boli (czat), jakość tam, gdzie boli (ocena). Bonus: osobne budżety rate limitu. |
| 2026-11-11 | Przy braku tokena o zamknięciu decyduje sędzia | Patrz pułapka 3. Determinizm tam, gdzie jest pewny; transkrypt tam, gdzie token zawiódł. |
| 2026-11-11 | Osobny wynik `walkaway` (gracz sam odkłada słuchawkę) | Rozłączenie z własnej woli po dwóch turach to nie to samo co wyczerpanie 12 tur, a gra pokazywała ten sam komunikat i kłamała graczowi w żywe oczy. |
| 2026-11-11 | Transkrypt trzymany w przeglądarce i odsyłany co turę | Gra jest jednoosobowa i w pełni lokalna, więc nie ma sesji serwerowej. Serwer ufa transkryptowi — do przemyślenia, **zanim** powstanie wspólny leaderboard. |

---

## Dług wizualny — zdiagnozowany 2026-11-11

Design wygląda surowo i **nie jest to wina stylu, tylko tego, że gra go nie używa.** Moodboard z Fazy 0 zaprojektował komplet powierzchni; ekrany rozgrywki wdrożyły może połowę:

| Element stylu | Zdefiniowany w `globals.css` | Używany w grze |
|---|---|---|
| `texture-paper` (papier) | ✅ | ✅ panele i dymki gracza |
| `vignette` (winieta) | ✅ | ✅ wszystkie ekrany |
| `text-foil` (złota folia) | ✅ | ✅ tytuł, kwota wypłaty |
| `shadow-desk` | ✅ | ✅ panele |
| **`texture-felt` (sukno biurka)** | ✅ | ❌ **nigdzie poza moodboardem** |

Sukno to najmocniejszy „biurkowy" element palety i leży nieużywane — dlatego ekran rozmowy czyta się jak zwykły ciemny czat, a nie jak biurko maklera o 21:00. Do tego portrety person (najlepszy asset w projekcie) są na ekranie rozmowy pomniejszone do 44–56 px.

**Wniosek:** to nie jest przeprojektowanie od zera, tylko dociągnięcie ekranów do stylu, który już istnieje i jest udokumentowany na `/moodboard`.

### Zmiana kierunku: Flash / Newgrounds (2026-11-12)
Decyzja Twoja: gra ma mieć wczucie flashowej gry z Newgrounds, nie powściągliwego flat vectora z Fazy 0. Dobry ruch — parodia cwanego brokera znosi przesadę lepiej niż elegancja.

**Paleta i tekstury zostają**, zmienia się język rysunku: przerysowane proporcje, wyolbrzymiona mimika, grubsza kreska, mocniejsze nasycenie na postaciach, fazowany chrom UI. Dzięki temu robota z Fazy 0 nie idzie do kosza.

Brief na komplet grafik: **`ART.md`** w korzeniu repo — bloki gotowe do kopiowania do narzędzia graficznego, z ustaloną kolejnością robienia (najpierw Jordan + Brenda + telefon jako test kierunku, dopiero potem reszta).

### ✅ Paleta: Miami Daylight (wdrożona 2026-11-12)
Wybrana z trzech wariantów pokazanych na tymczasowej stronie porównawczej (obecna „Night Desk" vs „Miami Daylight" vs „Miami Sunset"), renderowanych na prawdziwym ekranie rozmowy, nie na kwadracikach. Strona spełniła swoją rolę i została usunięta.

**Gra przeszła z ciemnego interfejsu na jasny.** Jasny czyta się jako „zabawne", ciemny jako „poważne" — a to jest parodia. Scena przesunięta z „biuro o 21:00" na Miami, późne popołudnie: boiler roomy z Miami lat 80. to zresztą celniejszy cel parodii niż generyczny Wall Street.

**Przy okazji przepisane nazwy tokenów z kolorowych na rolowe** (`navy-800` → `shell`, `oxblood` → `coral`, `felt` → `palm`, `paper` → `sand`). Powód: paleta odwróciła jasność, więc token `paper` pełnił dwie sprzeczne role naraz — jasny tekst na ciemnym tle (54 użycia) i jasna powierzchnia (6 użyć). Przy odwróceniu te role się rozjeżdżają i trzeba je było rozdzielić (`text-ink` vs `bg-sand`). Nazwy rolowe oznaczają, że następne przemalowanie to już tylko wartości.

| Token | Wartość | Rola |
|---|---|---|
| `sky` / `sky-pale` / `sky-deep` | `#bfe3f2` / `#e3f3fb` / `#3a9bc9` | tło świata, powierzchnie wyniesione, cień pod guzikami |
| `shell` / `sand` / `sand-dim` | `#ffffff` / `#fdf4e6` / `#f1e2c9` | panele, papier, papier w cieniu |
| `ink` / `ink-soft` / `ink-faint` | `#22364a` / `#4b6375` / `#5f7384` | obrysy i tekst, drugorzędny, podpisy |
| `brass` / `gold` / `gold-light` | `#98662b` / `#f0922f` / `#ffc061` | trim deco, akcja i kasa, highlight |
| `coral` / `coral-light` / `palm` | `#d91d40` / `#ff7d93` / `#297d64` | ostrzeżenia, highlight, sukces |
| `dialtone` | `#117d68` | wyłącznie wskaźnik trwającej rozmowy |

**Pułapka, którą to wyłapało:** odwrócenie jasności cicho psuje kontrast. Kolory, które były akcentami na granacie, na bieli wysiadają — `brass` spadł do **2.92:1**, `dialtone` do **2.96:1**, przy 41 i 6 użyciach. Policzone programowo (zrzutu ekranu nie dało się zrobić, bo rozszerzenie Chrome padło), pięć tokenów pociemnionych z zachowaniem odcienia. **Wszystkie 15 par tekst/tło przechodzi teraz WCAG AA.**

⚠️ Ilustracje SVG nie czytają tokenów CSS — mają własne bloki stałych w `ItemIcon.tsx` i `PersonaPortrait.tsx`, które trzeba było przefarbować osobno. To i tak zostanie zastąpione grafikami z `ART.md`.

---

## Infrastruktura (stan na 2026-11-11)

| Element | Stan |
|---|---|
| Repo | `github.com/Vibing-man4123/sell-me-this-pen` (prywatne), SSH, 7 commitów |
| Hosting | Vercel, projekt `sell-me-this-pen`, **Root Directory = `cold`** |
| Produkcja | https://sellmethispen.vercel.app (aliasy: `cold-roan`, `cold-rodion16`) |
| Auto-deploy | ✅ działa — `git push` na `main` buduje i publikuje bez żadnej komendy |
| Klucz Groq | `cold/.env.local` lokalnie + Vercel: Production / Preview / Development |
| Modele Groq | **Na Vercelu NIE są ustawione — i tak ma zostać.** `GROQ_CLIENT_MODEL` / `GROQ_JUDGE_MODEL` są opcjonalne, a wartości domyślne w `src/lib/server/groq.ts` to te zweryfikowane 11.11. Produkcja działa bez dodatkowej konfiguracji, a nazwy modeli odczytywane są per zapytanie, więc podmiana w panelu Vercela nie wymaga redeployu. |

**Pułapki, na które się nadziałem — żeby nie powtórzyć:**
- Przestrzeń `*.vercel.app` jest globalna. `sell-me-this-pen.vercel.app` należy do obcego projektu — zmiana nazwy projektu NIE tworzy aliasu, jeśli nazwa jest zajęta. Weryfikując deploy sprawdzaj treść (`<title>`), nie sam kod 200.
- Root Directory nie ustawia się sam po przeniesieniu apki do podkatalogu. Deploye z CLI działały, bo odpalane z `cold/`, ale build z GitHuba padłby na braku `package.json` w korzeniu.
- Prawdziwy klucz nigdy nie idzie do `.env.example` — ten plik jest śledzony przez gita. GitHub Push Protection złapał to i zablokował push; historię trzeba było przepisać i klucz zrotować.
- Nazwy modeli w `.env` starzeją się po cichu. `llama-3.3-70b-versatile` zniknął z Groq między Fazą 0 a 1 i wyszło to dopiero przy pierwszym realnym zapytaniu. Dlatego kod ma sensowne wartości domyślne, a 404 od Groq jest mapowane na błąd konfiguracji z widocznym komunikatem, a nie na „coś poszło nie tak".

---

## Decyzje projektowe

| Data | Decyzja | Dlaczego |
|---|---|---|
| 2026-11-08 | **Treść gry po angielsku** (kod, UI, dialogi, oceny) | Twój wybór. Spójne z tytułem, lepsze w portfolio, LLM-y lepiej radzą sobie z angielskim slangiem sprzedażowym. Ten plik i rozmowa zostają po polsku. |
| 2026-11-08 | Moodboard jako strona w aplikacji, nie plik w Figmie | Renderuje się z danych gry → nie zdezaktualizuje się. Przy okazji jest to pokazywalny artefakt w portfolio. |
| 2026-11-08 | Obsługa obiekcji dostaje wagę 35% | To jedyna część rozmowy, której nie da się „przegadać". Nagradzamy umiejętność, nie gadatliwość. |
| 2026-11-08 | Rangi nie mnożą kasy | Inaczej progresja robi się wykładnicza i balans siada po 20 minutach. |
| 2026-11-08 | Tokeny `[CLOSED]` / `[HANGUP]` zamiast wykrywania zamknięcia modelem | Tanio, deterministycznie, bez dodatkowego zapytania do LLM. |
| 2026-11-08 | Grafika generowana w SVG w kodzie, nie pliki PNG | Ostry w każdej rozdzielczości, waży tyle co nic, zmiana koloru to zmiana tokena. |
| 2026-11-09 | Tytuł: **„Sell Me This Pen"** | Tytuł i samouczek w jednym. Fraza jest stara i niezastrzeżona (banał ze szkoleń sprzedażowych sprzed *Wilka z Wall Street*), więc prawnie czysto — ale świadomie wiąże grę z tym filmem, co przy parodii jest plusem. |
| 2026-11-09 | Aplikacja w `cold/`, dokumenty projektu w korzeniu | Twoja preferencja. Koszt: Vercel wymaga ustawienia Root Directory. Poza tym zero wpływu. |

---

## Następny krok — FAZA 2 (Progression system)

1. **Rolodex** — ekran wyboru rozmowy; trasy `/call/[personaId]/[itemId]` już istnieją i są prerenderowane, więc to głównie UI i gating po randze
2. **Zapis progresji w localStorage** (Zustand jest zainstalowany od Fazy 0): saldo, zarobek życiowy, historia rozmów
3. **Ranking** — `rankFromEarnings()` i `hasRank()` są gotowe i przetestowane, trzeba je podpiąć pod odblokowywanie treści i ekran awansu
4. **Lifestyle Shop** — zakupy kosmetyczne, zero wpływu na mechanikę
5. Podpiąć wypłatę z `/api/judge` pod saldo (dziś kwota jest liczona i pokazywana, ale nigdzie nie ląduje)

**Nic nie jest potrzebne ode mnie z zewnątrz** — klucz Groq działa, modele zweryfikowane, deploy stoi.

**Limity Groq — świadomie odłożone (decyzja 2026-11-11).** 8000 tokenów/minutę na model wystarczy jednemu graczowi, ale nie klasie na jednym kluczu (patrz pułapka 2). **Nie zajmujemy się tym teraz.** To projekt pasjonacki, gra nie jest publiczna, a dla pojedynczej osoby limit jest niewyczuwalny. Temat wraca dopiero, gdy gra ma realnie trafić do więcej niż jednej pary rąk — wtedy do rozważenia klucz na ucznia, płatny tier albo kolejka. Liczby są zmierzone i zapisane wyżej, więc decyzja będzie szybka, kiedy przyjdzie jej czas.
Dopóki to nie nastąpi, jedyne co jest potrzebne, to przyjazny komunikat przy wyczerpaniu limitu — a ten **już działa** („The market just crashed").
