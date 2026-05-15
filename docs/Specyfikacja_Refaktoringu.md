# Specyfikacja Refaktoryzacji Systemu Wykresów USI

Niniejszy dokument przedstawia dwie alternatywne ścieżki odejścia od obecnej architektury opartej na przeglądarce (React + Vite + Playwright) na rzecz lżejszych, czysto programistycznych rozwiązań.

---

## Ścieżka 1: Czysty Python (Matplotlib / Seaborn)

Zastąpienie całego stosu JS skryptem Pythonowym, który generuje wykresy bezpośrednio do plików graficznych.

### Architektura
- **Silnik**: Matplotlib (backend `Agg`).
- **Dane**: Bezpośredni odczyt z JSON/CSV (`pandas`).
- **Matematyka**: Port istniejącej logiki matematycznej (agregacja Gaussa) z JS do Pythona.

### Kluczowe punkty implementacji
1. **Agregacja**: Implementacja funkcji `aggregate_gaussian` w Pythonie (zastąpienie `math.js`).
2. **Stylizacja Premium**:
    - Użycie `fill_between` z niestandardowymi mapami kolorów (Colormaps) dla gradientów.
    - Ręczne rysowanie ikon USI (gwiazdki, zera) jako niestandardowych markerów (`Path` w Matplotlib).
    - Usunięcie ramek (`spines`) i ustawienie niestandardowych czcionek przez `matplotlib.font_manager`.
3. **Automatyzacja**: Prosty skrypt CLI przyjmujący parametry (typ wykresu, sigma, kolory) i zapisujący plik `.png`.

### Zalety i Wady
- **Zalety**: Brak zależności od Node.js/Vite, brak otwierania portów sieciowych, natywne wsparcie w środowiskach analitycznych.
- **Wady**: Trudniejsze odwzorowanie "pixel-perfect" designu webowego (gradienty w Matplotlib są mniej elastyczne niż w CSS), konieczność przepisania logiki matematycznej.

---

## Ścieżka 2: Czysty Node.js SVG (Bez Przeglądarki)

Usunięcie Reacta i Playwrighta. Serwer generuje surowy kod SVG jako tekst, który jest następnie konwertowany na PNG.

### Architektura
- **Silnik**: `d3-shape` (do obliczania ścieżek SVG) + prosty system szablonów tekstowych.
- **Konwersja**: Biblioteka `sharp` (oparta na `libvips`) do błyskawicznej konwersji SVG -> PNG.
- **Środowisko**: Standardowy proces Node.js bez interfejsu graficznego.

### Kluczowe punkty implementacji
1. **Generowanie SVG**:
    - Wykorzystanie `d3.stack()` i `d3.area()` do obliczenia współrzędnych punktów.
    - Generowanie ciągu tekstowego `<svg>...</svg>` z zaszytymi gradientami (`<linearGradient>`).
    - Wstawianie ikon USI jako ścieżek `<path>` bezpośrednio w kodzie SVG.
2. **Layout**: Zastąpienie `foreignObject` i Flexboxa prostymi obliczeniami matematycznymi (pozycjonowanie etykiet na podstawie wyliczonych punktów środkowych segmentów).
3. **Pipeline**: Dane -> Obliczenia D3 -> Tekst SVG -> `sharp().png()` -> Zapis do pliku.

### Zalety i Wady
- **Zalety**: Ekstremalna wydajność (brak narzutu przeglądarki), brak zależności od środowiska graficznego (idealne pod Linux/Docker), zachowanie obecnej logiki matematycznej w JS.
- **Wady**: Brak "żywego" podglądu podczas pracy (widzimy tylko efekt końcowy), konieczność ręcznego liczenia zawijania tekstu i marginesów.

---

## Porównanie Rozwiązań

| Cecha | Obecnie (React+Playwright) | Ścieżka 1 (Python) | Ścieżka 2 (Node+SVG) |
| :--- | :--- | :--- | :--- |
| **Złożoność środowiska** | Wysoka (Vite + Browser) | Niska (Python) | Średnia (Node) |
| **Wydajność** | Niska (300-1000ms/wykres) | Wysoka (50-100ms) | Bardzo wysoka (<50ms) |
| **Jakość wizualna** | Najwyższa (CSS/Browser) | Dobra (Matplotlib) | Bardzo wysoka (SVG) |
| **Łatwość zmian** | Bardzo wysoka (UI) | Średnia (Kod) | Niska (Kod/Matematyka) |
| **Zależności** | npm, Chrome | pip, system libs | npm, sharp |

## Rekomendacja
- Jeśli priorytetem jest **integracja z innymi narzędziami analitycznymi** użytkownika: **Ścieżka 1 (Python)**.
- Jeśli priorytetem jest **pozbycie się przeglądarki przy zachowaniu jakości wizualnej**: **Ścieżka 2 (Node+SVG)**.
