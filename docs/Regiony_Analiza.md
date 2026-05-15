# Analiza Strony "Region" - USI Tracker

Strona "Region" pełni rolę centrum analitycznego, pozwalającego na głęboką analizę trendów rynkowych w konkretnych regionach (miastach) oraz porównywanie standardu inwestycji w czasie.

## 1. Architektura Danych
System opiera się na trzech głównych warstwach danych:
- **USImaster**: Główna baza wszystkich inwestycji (źródło prawdy).
- **Konkurencja Regiony**: Tabela pomocnicza (widok lub kopia USImaster), służąca do filtrowania danych dla wybranego regionu i przeprowadzania automatyzacji.
- **Tabele Wykresów (Analiza Agregacyjna)**: Cztery tabele (`Wykres Fasady`, `Wykres Teren`, `Wykres Balkony`, `Wykres Wnętrza`), które dynamicznie obliczają statystyki ważone czasowo.

## 2. Mechanizm Sterowania (Controls)
- **`miastokonk`**: Wybór regionu (np. "Warszawa", "Kraków"). Wszystkie tabele na stronie filtrują dane wg tej wartości.
- **`[slider 1]`**: Kontroluje parametr "wygładzania" (wariancji) rozkładu Gaussa. Wyższa wartość powoduje, że dane z odleglejszych kwartałów mają większy wpływ na obecny punkt wykresu.

## 3. Logika "Wykresów" (Kernel Density Estimation)
Wykresy nie są prostymi zestawieniami. Każdy punkt na osi czasu (reprezentowany przez wiersz w tabeli wykresu) to suma ważona wolumenu mieszkań (`Liczba Mieszkań`).

### Formuła Wagowania (Rozkład Normalny)
Sercem obliczeń jest formuła:
```cfl
(10 / 4 / Power(2 * Pi(), 0.5) * Exponent(-0.5 * (CVTeraz.Qrealizacji - Qrealizacji) * (CVTeraz.Qrealizacji - Qrealizacji) / 4 / [slider 1]))
```
- `Qrealizacji`: Punkt w czasie, dla którego liczymy wartość (np. obecny kwartał).
- `CVTeraz.Qrealizacji`: Termin realizacji konkretnej inwestycji z bazy.
- Formuła realizuje **rozkład normalny (Gaussa)**, gdzie waga inwestycji maleje wraz z oddaleniem jej terminu realizacji od punktu kontrolnego.

### Obliczanie Udziału (Normalizacja)
Dla każdego poziomu standardu (np. Fasada 0, 1, 2, 3, 4) tabela oblicza:
1. **Suma Ważona (dla danego poziomu)**: Suma mieszkań z inwestycji o danym standardzie, pomnożona przez ich wagę czasową.
2. **NMieszkan (Suma Całkowita Ważona)**: Suma mieszkań ze wszystkich inwestycji w regionie posiadających ocenę w danej kategorii, pomnożona przez wagi.
3. **Wynik**: `Suma Ważona / NMieszkan`.

Dzięki temu wykresy pokazują **procentowy udział różnych standardów w rynku** w ujęciu dynamicznym (smooth moving average).

## 4. Tabela "Konkurencja Regiony" - Silnik Automatyzacji
Tabela ta zawiera zaawansowane przyciski integrujące system z zewnętrznymi usługami:

### Integracje API:
- **RynekPierwotny (`rpLoadJSON`, `rpProcesJSON`)**: Pobiera szczegółowe dane o inwestycji (ID, slug, liczba mieszkań, lokalizacja) bezpośrednio z API rynekpierwotny.pl.
- **Otodom (`otoLoadJSON`, `otoProcesJSON`)**: Pobiera dane ze strony Otodom poprzez `ScraperAPI` i parsuje JSON ukryty w tagu `__NEXT_DATA__`.
- **Dropbox (`extraRP do DB`, `extraOTO do DB`, `grabIMG`)**: Automatycznie zapisuje obrazy i pliki JSON z ofert do odpowiednich folderów na Dropboxie, tworząc archiwum dowodów.
- **Gemini AI (`getGemini`, `unpackGeminiFBT`)**: Przesyła zdjęcia inwestycji do modelu Gemini (Vision), który analizuje je i zwraca oceny standardu (fasady, balkony, teren) w formacie JSON, które są następnie "rozpakowywane" do kolumn tabeli.

### Zaawansowane Formuły:
- **`ocenaLOG`**: Agreguje oceny z wielu kategorii w jeden indeks za pomocą logarytmicznej średniej wykładniczej (Log-Sum-Exp). Pozwala to na "karalność" niskich ocen bardziej niż premiowanie wysokich (bezpieczniejsza ocena standardu).
- **`GetRegion`**: Automatycznie przypisuje inwestycję do najbliższego regionu z tabeli `pomRegiony` na podstawie współrzędnych geograficznych (obliczenia `Distance`).

## 5. Obserwacje i Wydajność
- **Złożoność Obliczeniowa**: Tabele wykresów wykonują operację `ForEach` na dużym zbiorze danych (`USImaster`) dla każdego wiersza wykresu (21 wierszy). Przy 6700+ wierszach w USImaster, zmiana regionu lub slidera może powodować zauważalne opóźnienia ("obliczanie...").
- **Dependency Graph**: System jest bardzo gęsto powiązany. Zmiana nazwy kolumny w `USImaster` może "wyłożyć" przyciski w `Konkurencja Regiony`, które używają `ModifyRows` z bezpośrednimi referencjami.

## 6. Wnioski
Strona "Region" to zaawansowany dashboard analityczny, który wykracza poza standardowe możliwości Coda dzięki:
1. Zastosowaniu statystyki matematycznej (rozkład Gaussa) do analizy trendów.
2. Pełnej automatyzacji pozyskiwania danych (Scraping + Dropbox).
3. Wykorzystaniu AI (Gemini) do oceny jakościowej na podstawie materiałów wizualnych.
