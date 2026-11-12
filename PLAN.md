# Sell Me This Pen — Plan Rozwoju

> Tytuł: **"Sell Me This Pen"** (ustalony 2026-11-09; robocze warianty: "Dial Tone Dynasty", "Cold Call Tycoon", "The Rolodex"). Katalog roboczy aplikacji: `cold/`. Zamiast używać wizerunku prawdziwego Jordana Belforta (ryzyko prawne/wizerunkowe na publicznym portfolio), gracz wciela się w **oryginalną karykaturę** — "Jordan Beltford", parodystycznego brokera lat 90' z za dużym gelem na głowie. Ten sam vibe, zero problemów z prawami do wizerunku.

## Koncept w jednym zdaniu
Gracz jako karykatura cwanego brokera prowadzi cold calle sprzedając coraz absurdalniejsze przedmioty rosnąco dziwnym AI-klientom, zarabia kasę na podstawie realnej oceny jego rozmowy (charyzma/pewność/obsługa obiekcji/closing), i wydaje ją na coraz bardziej groteskowy luksusowy styl życia — klasyczna progression loop w stylu "Wall Street excess".

---

## Core Loop
1. **Rolodex** — wybierasz telefon do zrobienia (przedmiot + persona klienta) z listy odblokowanych
2. **Call** — czat (tekst, głos jako stretch goal) z AI-klientem o określonej osobowości/oporze
3. **Scoring** — po rozmowie: LLM-sędzia ocenia strukturalnie (JSON): charyzma, pewność, obsługa obiekcji, closing
4. **Payout** — wynik → kasa (im trudniejszy klient/przedmiot, tym wyższy mnożnik)
5. **Lifestyle Shop** — kasa → kosmetyczne upgrady (biuro, garnitury, jacht, cygara, samochód) — czysto parodystyczne, zero mechanicznego wpływu na rozgrywkę (to ważne: "sense of progression" bez psucia balansu)
6. **Rank up** — Intern → Junior Broker → Shark → Wolf → Legend — odblokowuje nowe, dziwniejsze przedmioty i trudniejsze persony

---

## Stack technologiczny

| Warstwa | Wybór | Dlaczego |
|---|---|---|
| Frontend+backend | **Next.js (App Router) + TypeScript** | jeden projekt, serverless functions jako backend-proxy do Groq (klucz API nigdy nie trafia do przeglądarki) |
| Styling | **Tailwind CSS** | szybkość, łatwo utrzymać konsekwentny styl |
| State | **Zustand** | lekkie, brak boilerplate Reduxa |
| LLM (dev/MVP) | **Groq (darmowy tier)** przez serverless proxy | zero kosztów na start, niska latencja — ważne w czacie |
| Persystencja progresji | **localStorage** (MVP) | brak potrzeby backendu/bazy na start — gra działa w pełni client-side |
| Leaderboard (stretch) | **Supabase (darmowy tier)** | jeśli chcecie wspólną tablicę wyników w klasie |
| Hosting | **Vercel (darmowy tier)** | deploy jedną komendą, szybkie ładowanie na szkolnych Chromebookach |
| Grafika | SVG rysowany ręcznie, brief w `ART.md` | "human touch" — nie generyczny AI-art. Inline SVG w komponentach: ostre w każdej rozdzielczości, waży tyle co nic, kolory z tokenów. |

---

## Grafika — "human touch"
Cel: uniknąć sterylnego, generycznego AI-artu. Dwie opcje, wybierz tę, na którą masz czas/skill:

- **Opcja A (polecana pod portfolio):** proste płaskie ilustracje wektorowe rysowane samemu w Figmie/Illustratorze — portrety 5-6 person klientów (powtarzane z drobnymi zmianami: inny ubiór/mimika), awatar gracza, ikony przedmiotów do sprzedania. Ograniczona paleta (np. navy/gold/czerwień — estetyka "Wall Street lata 90'"), gruby outline, mało detali = szybciej do zrobienia i spójnie wygląda. To dodatkowo pokazuje umiejętność designu, nie tylko kodu.
- **Opcja B:** szkice rysowane ręcznie (nawet na papierze), zeskanowane/przerysowane w prostym wektorze — mocniejszy "human touch", ale wolniejsze.

Mini moodboard do zrobienia na starcie: paleta kolorów + 1 przykładowy portret person + styl UI (np. estetyka "biurka maklera" — papierowe teksturowane tło, winietki, przyciski jak stare telefony).

---

## Harmonogram (orientacyjnie, tempo: kilka h/tydzień — do dostosowania)

### Faza 0 — Setup & design (2-3 dni)
- Scaffold Next.js + TS + Tailwind, deploy szkieletu na Vercel
- Zdefiniowanie schematu oceny (JSON rubric) i struktury promptów person
- Moodboard/styl graficzny (paleta, 1 przykładowa ilustracja)

### Faza 1 — Core call loop (MVP) (~1 tydzień)
- Serverless proxy do Groq (klucz API bezpieczny po stronie serwera)
- UI czatu z jedną personą i jednym przedmiotem
- LLM-sędzia ze structured output + ekran wyniku (breakdown)
- Przelicznik kasy z wyniku

### Faza 2 — Progression system (~1 tydzień)
- Rolodex: 8-10 kombinacji przedmiot×persona na start
- System rankingów odblokowujący nowe calle
- Lifestyle Shop (kosmetyczne zakupy, bez wpływu na mechanikę)
- Zapis progresji w localStorage

### Faza 3 — Humor & polish treści (~1 tydzień)
- Pisanie: lista absurdalnych przedmiotów, osobowości person, teksty rankingów/shopu w tonie parodii
- Przejście graficzne: portrety person, ikony, tła/tekstury
- (opcjonalnie) sfx telefonu/biura dla humoru

#### Grafiki — pełny brief w `ART.md`
Kierunek ustalony 2026-11-12: **Flash / Newgrounds ok. 2003** zamiast powściągliwego flat vectora z Fazy 0. Przerysowane proporcje, wyolbrzymiona mimika, gruba kreska.

**Decyzja do podjęcia PRZED robieniem grafik: paleta.** Porównanie trzech wariantów (obecna „Night Desk" vs „Miami Daylight" vs „Miami Sunset") stoi na `/moodboard/palette`. Powód terminu: paleta w kodzie to ~15 tokenów CSS + 2 bloki stałych w SVG, czyli zmiana tania. Ale **30 gotowych grafik w złych kolorach to już nie jest tanie** — dlatego paleta musi być zaklepana pierwsza.

**Braki wykryte przy pisaniu briefu (2026-11-12) — rzeczy, o których plan milczał, a bez których gra nie wygląda jak gra:**

| Brak | Dlaczego to problem |
|---|---|
| **Jordan Beltford nie istnieje jako grafika** | Jest w stałej `PLAYER_CHARACTER`, ekran tytułowy o nim opowiada, gracz się w niego wciela — i nigdzie go nie widać. To twarz gry. |
| **Telefon nie istnieje** | Centralny rekwizyt całej gry. To przez jego brak ekran rozmowy czyta się jak zwykły czat, a nie jak biurko maklera. |
| **Tło biurka nie istnieje** | Ekran rozmowy to dziś płaski granat. Moodboard zaprojektował sukno, lampę i bałagan na biurku — nic z tego nie weszło. |
| **Miny person** | Gra **wie**, jak idzie rozmowa (opór / zmiękczenie / zamknięcie), a twarz klienta na to nie reaguje. Najtańszy sposób na „wczucie": 3 miny zamiast 1. |
| **`texture-felt` nieużywane** | Sukno biurka zdefiniowane w `globals.css` i użyte wyłącznie na moodboardzie. Najmocniejszy „biurkowy" element palety leży odłogiem. |

**Kolejność robienia (z `ART.md`):** najpierw TYLKO Jordan + Brenda (3 miny) + telefon jako test kierunku → pokazać → dopiero potem reszta. Trzy assety w złym stylu to strata, trzydzieści to katastrofa.

### Faza 4 — Classroom-ready polish (3-5 dni)
- Test na słabszym sprzęcie (Chromebooki szkolne) — szybki ładowanie, brak loginu wymaganego
- Friendly error handling gdy Groq rate-limit się wyczerpie (komunikat w tonie gry, np. "rynek się zawalił, spróbuj za chwilę")
- Responsywność (tablet/laptop)
- Finalny deploy + ewentualny tutorial/onboarding ekran

**Razem do grywalnego, pokazywalnego MVP: ~4-5 tygodni w tempie kilka h/tydzień.**

### Faza 5 — Stretch goals (bez limitu czasowego)
- Wspólny leaderboard klasowy (Supabase)
- Input głosowy + metryki mowy (tempo, filler words)
- Więcej person/przedmiotów, "przedmiot dnia" generowany przez LLM

---

## Ryzyka do pamiętania
- **Konsystencja oceny LLM** — ustalić rubric z few-shot przykładami przed fazą 3, żeby oceny nie skakały losowo
- **Limity darmowego Groq** — monitorować rate limity, zaprojektować UX tak, żeby wyczerpanie limitu nie wyglądało jak błąd apki, a jak część żartu
- **Realny Jordan Belfort** — trzymać się oryginalnej karykatury, nie jego imienia/wizerunku, w opisie projektu
