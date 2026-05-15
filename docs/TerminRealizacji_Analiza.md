# Analiza Tabeli TerminRealizacji w USI Tracker

## 1. Cel i Idea Tabeli
Tabela `TerminRealizacji` pełni rolę **warstwy normalizacji czasowej** w systemie USI Tracker. Zamiast obliczać parametry czasowe (takie jak odległość od daty bieżącej) indywidualnie dla każdej inwestycji, system przypisuje inwestycje do konkretnych rekordów w tej tabeli (reprezentujących kwartały).

### Kluczowe funkcje:
*   **Centralizacja logiki czasowej**: Pozwala na zmianę definicji "dzisiaj" lub parametrów wagowych w jednym miejscu.
*   **Normalizacja danych**: Inwestycje są grupowane według kwartałów, co ułatwia agregację (np. sumowanie liczby mieszkań oddawanych w danym okresie).
*   **Ważenie projektów**: Obliczanie wagi statystycznej dla inwestycji w zależności od tego, jak blisko (w czasie) znajdują się od punktu odniesienia (zazwyczaj daty dzisiejszej).

---

## 2. Struktura Danych (Schema)

| Kolumna | Typ | Opis |
| :--- | :--- | :--- |
| **Kwartał** | Tekst (Display) | Nazwa kwartału (np. "1 kw. 2025"). Służy jako klucz wizualny. |
| **DataRealizacji** | Data | Graniczna data zakończenia dla danego kwartału (zazwyczaj ostatni dzień kwartału). |
| **Czasrealizacji** | Formuła | `DataRealizacji - Today()`. Liczba dni pozostałych do realizacji lub dni, które upłynęły (wartości ujemne). |
| **Qrealizacji** | Formuła | `Floor(Czasrealizacji / 91, 1)`. Konwersja dni na kwartały (przyjmując 91 dni jako kwartał). |
| **waga** | Formuła | Statystyczna waga Gaussa przypisana do kwartału (szczegóły poniżej). |
| **Liczba mieszkan** | Formuła | Suma mieszkań z tabeli `USImaster` dla inwestycji przypisanych do tego terminu. |

---

## 3. Kluczowe Formuły i Logika

### A. Obliczanie Dystansu Kwartalnego (`Qrealizacji`)
```javascript
Floor(Czasrealizacji / 91, 1)
```
Formuła ta zamienia dystans w dniach na dyskretną liczbę kwartałów. Jest to kluczowy parametr dla funkcji wagowej.

### B. Funkcja Wagowa (`waga`)
```javascript
10 / 4 / Power(2 * Pi(), 0.5) * Exponent(-0.5 * Qrealizacji * Qrealizacji / 4 / [slider 1])
```
Jest to implementacja **rozkładu normalnego (Gaussa)**.
*   **Cel**: Nadanie największej wagi projektom, których termin realizacji jest bliski "dzisiaj" (`Qrealizacji` bliskie 0).
*   **Parametr `[slider 1]`**: Pełni rolę wariancji (rozmycia). Pozwala użytkownikowi kontrolować, jak szybko waga spada wraz z upływem czasu (im większa wartość slidera, tym szersze okno czasowe projektów branych pod uwagę z istotną wagą).
*   **Stała `10/4/sqrt(2pi)`**: Służy do normalizacji amplitudy wagi.

### C. Agregacja Podaży (`Liczba mieszkan`)
```javascript
USImaster.Filter(
  Termin = thisRow AND Not(Ocena.Contains(Brak, [Niedostateczne dane], ""))
). [Liczba Mieszkań].Sum()
```
Tabela dynamicznie zlicza podaż mieszkań dla każdego kwartału, filtrując projekty o niskiej wiarygodności danych.

---

## 4. Integracja z Systemem (Workflow)

### Relacja z `usiKonkurencja` / `USImaster`
Tabela `TerminRealizacji` jest tabelą nadrzędną dla projektów:
1.  **Lookup**: Kolumna `Termin` w tabeli projektów jest odnośnikiem do `TerminRealizacji`.
2.  **Przeniesienie Własności**: Projekty dziedziczą dystans czasowy poprzez formuły typu `Termin.Qrealizacji`.
3.  **Automatyzacja**: Przycisk `popTermin` w tabeli projektów pozwala na szybkie przypisanie lub aktualizację terminu na podstawie tekstowego zapisu kwartału.

## 5. Wnioski
Struktura tabeli `TerminRealizacji` wskazuje na zaawansowane podejście do **analityki inwestycyjnej**. Zastosowanie wagowania gaussowskiego pozwala na tworzenie rankingów i ocen, które w sposób płynny uwzględniają horyzont czasowy, faworyzując projekty najbardziej aktualne (najbliższe oddaniu lub niedawno oddane), przy jednoczesnym zachowaniu wglądu w dalszą przyszłość i przeszłość.
