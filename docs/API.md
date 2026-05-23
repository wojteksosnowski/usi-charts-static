# Dokumentacja REST API

Serwer wystawia endpoint REST API służący do renderowania wykresów mieszkaniowych jako obrazy PNG.

## `GET /chart`

Generuje wykres na podstawie przekazanych parametrów i zwraca go jako obraz.

### Parametry zapytania (Query Parameters)

Wszystkie parametry są opcjonalne i posiadają wartości domyślne.

| Parametr | Typ | Domyślnie | Opis |
| --- | --- | --- | --- |
| `chartType` | `string` | `'Fasady'` | Typ generowanego wykresu (np. 'Fasady'). |
| `colorA` | `string` | `'#f39200'` | Kolor początkowy gradientu tła (w formacie HEX). |
| `colorB` | `string` | `'#ffd200'` | Kolor końcowy gradientu tła (w formacie HEX). |
| `width` | `number` | `1200` | Szerokość wygenerowanego obrazu w pikselach. |
| `height` | `number` | `400` | Wysokość wygenerowanego obrazu w pikselach. |
| `sigma` | `number` | `0.8` | Parametr sigma dla wygładzania Gaussa przy agregacji danych. |
| `title` | `string` | `''` | Opcjonalny tytuł wykresu wyświetlany w lewym górnym rogu. |
| `startYear` | `number` | `2022` | Rok początkowy osi czasu (oś X). |
| `startQuarter` | `number` | `1` | Kwartał początkowy osi czasu (1-4). |
| `quartersCount` | `number` | `12` | Całkowita liczba wyświetlanych kwartałów na osi czasu. |

### Odpowiedź

- **Status Code**: `200 OK`
- **Content-Type**: `image/png`
- **Body**: Zwraca strumień bitów wyrenderowanego pliku PNG.

### Przykłady użycia

Pobranie domyślnego wykresu:
```bash
curl -o chart.png "http://localhost:3001/chart"
```

Pobranie wykresu z własnym tytułem, mniejszymi wymiarami i inną kolorystyką:
```bash
curl -o custom_chart.png "http://localhost:3001/chart?title=Analiza%20Rynku&width=800&height=300&colorA=%23000000&colorB=%23444444"
```
