# Anforderungen - Game of Life

## Projektbeschreibung
Implementierung von Conways Game of Life - ein zellulärer Automat, der auf einem zweidimensionalen Gitter simuliert wird.

## Funktionale Anforderungen

### 1. Gitter und Zellen
- [x] Zweidimensionales Gitter zur Darstellung der Zellen
- [x] Zellen können zwei Zustände haben: lebendig oder tot
- [x] Konfigurierbare Größe des Gitters (z.B. 50x50, 100x100)

### 2. Spielregeln (Conway's Game of Life)
- [x] Jede lebende Zelle mit 2-3 lebenden Nachbarn bleibt am Leben
- [x] Jede lebende Zelle mit weniger als 2 oder mehr als 3 Nachbarn stirbt
- [x] Jede tote Zelle mit genau 3 lebenden Nachbarn wird lebendig
- [x] Nachbarschaften berücksichtigen die 8 umliegenden Zellen

### 3. Simulation
- [x] Generationen / Schritte durchlaufen
- [x] Alle Zellen werden synchron pro Generation aktualisiert
- [x] Kontinuierliche Simulation mit konfigurierbarem Tempo
- [x] Verdoppelte Simulationsgeschwindigkeit für flüssigere Animation

### 4. Benutzerinteraktion
- [x] Start/Pause/Reset Funktionen für die Simulation
- [x] Tempo der Simulation einstellbar
- [x] Möglichkeit, Zellen manuell zu setzen/löschen vor der Simulation
- [x] Anzeige der aktuellen Generationsnummer
- [x] Drag-to-paint Funktionalität mit der Maus

### 5. Visualisierung
- [x] Grafische Darstellung des Gitters in HTML/Canvas
- [x] Unterscheidung zwischen lebenden und toten Zellen (Pink #ff1493 und Orange #ff8c00)
- [x] Responsive Layout für verschiedene Bildschirmgrößen
- [x] Pink-Orange Gradient Design

## Technische Anforderungen

### Frontend (HTML/JavaScript)
- [x] HTML-Struktur für UI (Buttons, Eingabefelder, Canvas/Grid)
- [x] CSS-Styling für ansprechendes Design
- [x] JavaScript für Game-Logik und Interaktionen
- [x] Rendering-Optimierung für flüssige Animation

### Code-Qualität
- [x] Sauberer, wartbarer Code mit Kommentaren
- [x] Modularisierte Funktionen
- [x] Error Handling

## Nice-to-Have Features
- [ ] Vordefinierte Muster (Glider, Blinker, Block, etc.)
- [ ] Speichern und Laden von Konfigurationen
- [ ] Zoom-Funktionalität
- [ ] Statistiken (Anzahl lebender Zellen, Generationen pro Sekunde)
- [ ] Dunkler Modus

## Akzeptanzkriterien
- [x] Simulation funktioniert gemäß Conway's Regeln
- [x] UI ist intuitiv bedienbar
- [x] Performance ist zufriedenstellend auch bei größeren Gittern
- [x] Code ist dokumentiert und wartbar
- [x] Farben: Pink (#ff1493) und Orange (#ff8c00) für lebende Zellen
- [x] Simulationsgeschwindigkeit verdoppelt für flüssigere Animation
