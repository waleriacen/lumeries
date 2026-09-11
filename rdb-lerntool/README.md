# RDB-Lerntool – Rahmenbedingungen der Berufsbildung

Lernmaterial für die HFH-Klausur **MP00-RDB-PK1** (14.03.2026, 100 Min, 100 P, keine Hilfsmittel).
Erstellt aus den **6 prüfungsrelevanten Studienbriefen**:

1. SB1 – Einführung in das System der beruflichen Bildung (01-1110-001-2)
2. SB2 – Rechtliche Grundlagen der Berufsbildung (01-1110-002-2)
3. SB3 – Schulrecht I – Recht der Ausbildung in den Pflege- und Gesundheitsberufen (01-1110-003-2)
4. SB4 – Schulrecht II (01-1110-004-1)
5. SB5 – Berufliche Bildung im internationalen Vergleich (01-1110-005-2)
6. Heterogenität und Leistungsbewertung (01-1108-005-2)

## 📱 `RDB-Lerntool.html`
Das interaktive Lerntool als **eine einzige Datei** – komplett **offline** und **ohne JavaScript** lauffähig
(Bilder sind als base64 eingebettet). Einfach auf dem iPhone öffnen/in der Vorschau anzeigen.

Enthält:
- **Reiter pro Studienbrief** mit einfachen Erklärungen + Beispielen (Fachwörter erklärt)
- **Modell-Bilder** aus den Briefen (sauber eingebettet, mit Quellenseite)
- **113 Karteikarten** (Frage/Antwort) mit ausklappbarer Box „💡 Einfach erklärt", Vergleiche als Tabellen
- **Abfragemodus** – deckungsgleich mit den Karteikarten (Frage sichtbar, Antwort aufklappen)
- **94 Übungsaufgaben** aus den Briefen mit vollständigen Musterlösungen
- **📋 Spickzettel** – alle Definitionen & Modelle kompakt
- **🔊 Vorlese-Button** (Web Speech API; funktioniert in einem Browser mit JS, in der reinen Vorschau inaktiv)

> Tabs funktionieren ohne JS über das CSS-Radio-Pattern; Ausklappboxen über natives `<details>`.
> Fallback: Sollte ein Renderer `:checked` ignorieren, werden einfach **alle** Inhalte untereinander angezeigt (nie eine leere Seite).

## 🔊 `notebooklm/` – Podcast-Skripte
Pro Studienbrief eine eigene Markdown-Datei (Fließtext, Fachwörter sofort einfach erklärt, vollständig)
zum Import in **NotebookLM** für einen Lern-Podcast.

## Technik
- `generate.py` baut `RDB-Lerntool.html` aus den Inhaltsdateien in `content/` und den Bildern in `figures/`.
- Neu erzeugen: `python3 generate.py`
