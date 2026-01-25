# Anhang A2 – Testprotokoll Budgetlogik

**Projekt:** BetterBudgeter
**Kapitel:** 7.2 Testprotokolle
**Bezug:** Kapitel 4.3.4 – Test der Budgetlogik
**Testdatum:** Januar 2026
**Tester:** Projektteam BetterBudgeter

---

## Testprotokoll

Die nachfolgende Tabelle dokumentiert die durchgeführten Tests zur Budgetlogik. Die Tests wurden manuell im Entwicklungssystem durchgeführt und prüfen die drei Kernfunktionen:

1. Korrektes Speichern definierter Budgets
2. Korrekte Berechnung des Budgetverbrauchs
3. Korrekte Anzeige der Schwellenwerte

---

### Testumgebung

- **System:** Lokale Entwicklungsumgebung
- **Datenbank:** Supabase PostgreSQL (Testinstanz)
- **Browser:** Chrome (aktuelle Version)

---

### Tabelle A2 – Testprotokoll Budgetlogik

| Testfall-Nr. | Testbeschreibung | Testdaten (Budget / Ausgaben) | Durchführung | Erwartetes Ergebnis | Tatsächliches Ergebnis | Testergebnis |
|--------------|------------------|-------------------------------|--------------|---------------------|------------------------|--------------|
| **T-BL-01** | Neues Budget für Kategorie speichern | Budget: Lebensmittel = 200,00 EUR / Ausgaben: keine | 1. Einstellungen öffnen 2. Im Feld "Lebensmittel" den Wert 200 eingeben 3. Speichern klicken | Budget wird in der Datenbank gespeichert. Erfolgsmeldung erscheint. | Budget wurde gespeichert. Meldung "Budgets saved successfully" erschien. | bestanden |
| **T-BL-02** | Bestehendes Budget aktualisieren | Budget: Lebensmittel = 200,00 EUR (bestehend), neuer Wert = 250,00 EUR / Ausgaben: keine | 1. Einstellungen öffnen 2. Wert von 200 auf 250 ändern 3. Speichern klicken | Budgetwert wird auf 250 EUR aktualisiert. Erfolgsmeldung erscheint. | Wert wurde auf 250 EUR aktualisiert. Erfolgsmeldung erschien. | bestanden |
| **T-BL-03** | Budget für Kategorie löschen | Budget: Lebensmittel = 250,00 EUR (bestehend) / Ausgaben: keine | 1. Einstellungen öffnen 2. Feld "Lebensmittel" leeren 3. Speichern klicken | Budget wird aus der Datenbank entfernt. Kategorie erscheint nicht mehr im Dashboard. | Budget wurde entfernt. Kategorie wird im Dashboard nicht mehr angezeigt. | bestanden |
| **T-BL-04** | Budgetverbrauch bei keinen Ausgaben | Budget: Transport = 100,00 EUR / Ausgaben: 0,00 EUR | 1. Budget für Transport anlegen 2. Dashboard aufrufen | Verbrauch = 0 EUR. Verbleibend = 100 EUR. Prozentanzeige = 0%. | Anzeige: 0,00 EUR von 100,00 EUR. Verbleibend: 100,00 EUR. 0% Verbrauch. | bestanden |
| **T-BL-05** | Budgetverbrauch bei Ausgaben unter Budget | Budget: Freizeit = 150,00 EUR / Ausgaben: 75,00 EUR | 1. Budget für Freizeit anlegen 2. Transaktion mit 75 EUR Ausgabe importieren 3. Dashboard aufrufen | Verbrauch = 75 EUR. Verbleibend = 75 EUR. Prozentanzeige = 50%. | Anzeige: 75,00 EUR von 150,00 EUR. Verbleibend: 75,00 EUR. 50% Verbrauch. | bestanden |
| **T-BL-06** | Budgetverbrauch bei Ausgaben über Budget | Budget: Kleidung = 80,00 EUR / Ausgaben: 120,00 EUR | 1. Budget für Kleidung anlegen 2. Transaktionen mit insgesamt 120 EUR importieren 3. Dashboard aufrufen | Verbrauch = 120 EUR. Verbleibend = 0 EUR. Prozentanzeige = 150%. | Anzeige: 120,00 EUR von 80,00 EUR. Verbleibend: 0,00 EUR. 150% Verbrauch. | bestanden |
| **T-BL-07** | Schwellenwert: Status "On Track" (unter 80%) | Budget: Lebensmittel = 200,00 EUR / Ausgaben: 100,00 EUR (50%) | 1. Budget anlegen 2. Ausgaben von 100 EUR importieren 3. Dashboard aufrufen | Status "On Track" (grün). Keine Warnung. | Fortschrittsbalken grün. Keine Warnung angezeigt. | bestanden |
| **T-BL-08** | Schwellenwert: Status "Warning" (80-99%) | Budget: Lebensmittel = 200,00 EUR / Ausgaben: 170,00 EUR (85%) | 1. Budget anlegen 2. Ausgaben von 170 EUR importieren 3. Dashboard aufrufen | Status "Warning" (gelb). Warnhinweis wird angezeigt. | Fortschrittsbalken gelb/orange. Warnhinweis "Getting Close" angezeigt. | bestanden |
| **T-BL-09** | Schwellenwert: Status "Over Budget" (100% und mehr) | Budget: Lebensmittel = 200,00 EUR / Ausgaben: 220,00 EUR (110%) | 1. Budget anlegen 2. Ausgaben von 220 EUR importieren 3. Dashboard aufrufen | Status "Over Budget" (rot). Hinweis auf Budgetüberschreitung. | Fortschrittsbalken rot. Hinweis "Over Budget" angezeigt. | bestanden |

---

### Zusammenfassung

| Kategorie | Anzahl Tests | Bestanden | Nicht bestanden |
|-----------|--------------|-----------|-----------------|
| Speichern von Budgets | 3 | 3 | 0 |
| Berechnung des Verbrauchs | 3 | 3 | 0 |
| Anzeige der Schwellenwerte | 3 | 3 | 0 |
| **Gesamt** | **9** | **9** | **0** |

---

### Bemerkungen

- Alle Tests wurden erfolgreich abgeschlossen.
- Die Schwellenwerte (80% für Warnung, 100% für Budgetüberschreitung) sind im System als Konstanten hinterlegt und funktionieren wie spezifiziert.
- Die Budgetberechnung basiert auf den Transaktionen des aktuellen Kalendermonats.
- Nur Ausgaben (Expenses) werden für die Budgetberechnung herangezogen. Einnahmen werden nicht berücksichtigt.

---

*Dokumentiert gemäß den Anforderungen der IHK-Projektdokumentation.*
