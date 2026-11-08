# Dial Tone Dynasty — Dziennik postępów

> Plik prowadzony równolegle do `PLAN.md`. `PLAN.md` = co zamierzamy, `PROGRESS.md` = co faktycznie zrobione i jak stoimy z czasem.

**Start projektu:** 2026-11-08
**Ostatnia aktualizacja:** 2026-11-08

---

## Status timeline'u

| Faza | Zakres | Budżet z planu | Planowany koniec | Status |
|---|---|---|---|---|
| **0** | Setup & design | 2–3 dni | 2026-11-10 | 🟢 **Zrobione w 1 dzień** (poza deployem — czeka na Ciebie) |
| 1 | Core call loop (MVP) | ~1 tydzień | 2026-11-17 | ⚪ Nie zaczęte |
| 2 | Progression system | ~1 tydzień | 2026-11-24 | ⚪ Nie zaczęte |
| 3 | Humor & polish treści | ~1 tydzień | 2026-12-01 | ⚪ Nie zaczęte |
| 4 | Classroom-ready polish | 3–5 dni | 2026-12-06 | ⚪ Nie zaczęte |

**Jak się trzymamy:** przed harmonogramem. Faza 0 miała zająć 2–3 dni, zamknięta w jednej sesji, a przy okazji wyprzedziliśmy część roboty z Faz 2–3 (komplet 6 person i 6 przedmiotów zamiast jednego przykładu, drabinka rang, pełny system payoutu). Realistyczny termin grywalnego MVP: **początek grudnia 2026**, z zapasem.

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

### 🔴 Deploy na Vercel — **czeka na Ciebie**
Jedyny punkt Fazy 0, którego nie mogę domknąć sam: wymaga Twojego logowania.
```bash
npx vercel login
npx vercel --prod
```
Repo jest gotowe (build przechodzi, `.vercel` w `.gitignore`). Daj znać jak przejdzie.

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

---

## Następny krok — FAZA 1 (Core call loop)

1. Route handler `POST /api/call` — proxy do Groq, klucz tylko po stronie serwera, streaming odpowiedzi klienta
2. UI czatu: telefon na biurku, dymki, licznik pozostałych tur, wskaźnik „na linii"
3. Route handler `POST /api/judge` — structured output, walidacja Zodem, retry przy złym JSON-ie
4. Ekran wyniku: rozbicie na 4 kryteria, cytaty, coaching, naliczona prowizja
5. Friendly error gdy Groq zwróci rate limit (w tonie gry — „rynek się zawalił")

**Zanim zacznę Fazę 1 potrzebuję od Ciebie:** klucz API z https://console.groq.com/keys wklejony do `.env.local` (plik jest w `.gitignore`, klucz nigdzie nie wycieknie).
