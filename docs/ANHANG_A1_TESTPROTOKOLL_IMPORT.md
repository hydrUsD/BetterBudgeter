# Anhang – Tabelle A1: Testprotokoll Import-Tests

Dieses Dokument enthält das Testprotokoll für die in Kapitel 4.3.1 beschriebenen Import-Tests.

---

## Tabelle A1 – Testprotokoll Import-Tests

| Testfall-Nr. | Testbeschreibung | Testvoraussetzungen | Durchführung | Erwartetes Ergebnis | Tatsächliches Ergebnis | Testergebnis |
|--------------|------------------|---------------------|--------------|---------------------|------------------------|--------------|
| IMP-01 | Erstmaliger Import von Kontodaten | Benutzer ist angemeldet; mindestens ein Bankkonto ist verknüpft; keine Transaktionen in der Datenbank vorhanden | 1. Anmeldung im System<br>2. Navigation zum Dashboard<br>3. Klick auf Schaltfläche „Transaktionen synchronisieren" | Alle Transaktionen werden in die Datenbank eingefügt; Erfolgsmeldung mit Anzahl der importierten Datensätze wird angezeigt | Alle Transaktionen wurden korrekt importiert; Meldung „X Transaktionen importiert" erscheint | bestanden |
| IMP-02 | Wiederholter Import identischer Daten (Idempotenz) | Benutzer ist angemeldet; Bankkonto ist verknüpft; Transaktionen aus Testfall IMP-01 sind bereits in der Datenbank vorhanden | 1. Anmeldung im System<br>2. Navigation zum Dashboard<br>3. Erneuter Klick auf Schaltfläche „Transaktionen synchronisieren" | Keine doppelten Einträge entstehen; bestehende Datensätze werden aktualisiert; Meldung „Alle Transaktionen bereits aktuell" oder ähnlich wird angezeigt | Keine Duplikate vorhanden; Datenbank enthält unveränderte Anzahl an Datensätzen; entsprechende Meldung erscheint | bestanden |
| IMP-03 | Import bei leerem Datensatz (keine Transaktionen vorhanden) | Benutzer ist angemeldet; Bankkonto ist verknüpft; Bankkonto enthält keine Transaktionen im abgefragten Zeitraum | 1. Anmeldung im System<br>2. Navigation zum Dashboard<br>3. Klick auf Schaltfläche „Transaktionen synchronisieren" | System verarbeitet leere Rückgabe ohne Fehler; Meldung „Keine neuen Transaktionen" oder ähnlich wird angezeigt | Keine Fehlermeldung; System zeigt entsprechende Hinweismeldung an | bestanden |
| IMP-04 | Import bei unvollständigem Datensatz (fehlende Pflichtfelder) | Benutzer ist angemeldet; Bankkonto ist verknüpft; Quelldaten enthalten Transaktionen mit fehlenden oder ungültigen Pflichtfeldern | 1. Anmeldung im System<br>2. Navigation zum Dashboard<br>3. Klick auf Schaltfläche „Transaktionen synchronisieren" | Gültige Transaktionen werden importiert; fehlerhafte Datensätze werden übersprungen; Hinweismeldung über übersprungene Einträge wird angezeigt | Gültige Daten wurden importiert; Meldung „X Transaktionen importiert, Y übersprungen" erscheint | bestanden |

---

## Erläuterungen

**Testfall IMP-01:** Prüft die grundlegende Funktionsfähigkeit des Importvorgangs bei erstmaliger Ausführung.

**Testfall IMP-02:** Prüft die Idempotenz des Imports. Durch eine eindeutige Kennung pro Transaktion wird sichergestellt, dass mehrfaches Ausführen des Imports keine doppelten Einträge erzeugt.

**Testfall IMP-03:** Prüft das Systemverhalten bei Abwesenheit von Daten. Das System soll auch ohne Daten stabil arbeiten und den Benutzer entsprechend informieren.

**Testfall IMP-04:** Prüft die Fehlertoleranz des Imports. Unvollständige oder fehlerhafte Datensätze sollen den Gesamtimport nicht abbrechen, sondern einzeln übersprungen werden.

---

## Testdurchführung

- **Testdatum:** [Datum eintragen]
- **Tester:** [Name eintragen]
- **Testumgebung:** Lokale Entwicklungsumgebung mit simulierter Bankschnittstelle
- **Testdaten:** Automatisch generierte Beispieldaten

---

*Dieses Dokument ist Teil der Projektdokumentation (Kapitel 7.2 – Testprotokolle).*
