# Progress-Datenmodell Version 2

Diese Dokumentation beschreibt die lokale Fortschrittsschicht Version 2 und ihre Firebase-Synchronisation.

## Speicherort

- Lokaler Fallback: `localStorage`
- Schlüssel: `chemieBindungenProgress`
- Version: `2`
- Keine Namen, E-Mail-Adressen oder Schülercodes

## Firebase-Integration

Die Anmeldung erfolgt über Firebase Authentication mit E-Mail/Passwort. Auf der Oberfläche wird weiterhin ausschließlich der Schülercode eingegeben. Daraus wird intern reproduzierbar eine technische Adresse der Form `normalisierter-code@chemie-schueler.invalid` gebildet; diese Adresse wird nicht angezeigt und nicht im Fortschrittsdokument gespeichert. Unbekannte Codes werden nicht automatisch als Konten angelegt.

Nach erfolgreicher Anmeldung wird die Firebase Auth UID verwendet. Der Lernstand liegt ausschließlich im Dokument `/students/{uid}`. Der Zugriff wird durch die UID-basierte Firestore-Regel geschützt.

Beim Login wird ein vorhandener Cloud-Fortschritt geladen. Existiert das Dokument noch nicht, wird der vorhandene lokale Version-2-Stand übernommen und erstmals gespeichert. Änderungen werden weiterhin synchron lokal gespeichert und - sofern die Cloud erreichbar ist - mit kurzer Verzögerung nach Firestore geschrieben. Bei vorübergehenden Netzwerkfehlern bleibt der lokale Stand nutzbar; die nächste Fortschrittsänderung bzw. erneute Anmeldung versucht die Synchronisation erneut.

Beim Logout wird Firebase `signOut()` ausgeführt und der lokale Login- sowie Fortschrittscache entfernt, damit kein vorheriger Lernstand für den nächsten Nutzer angezeigt wird. Durch das UID-Dokument kann derselbe Schüler auf einem anderen Gerät seinen Cloud-Lernstand laden.

## Grundstruktur

```js
{
  version: 2,
  completedMissions: [],
  currentMission: 1,
  unlockedKnowledge: [],
  lastPosition: "lewis.html",
  modules: {
    pse: {},
    bindungscode: {},
    ionenbindung: {},
    salze: {},
    atombindung: {},
    metallbindung: {}
  }
}
```

`completedMissions`, `currentMission` und `unlockedKnowledge` bleiben aus Abwärtskompatibilitätsgründen auf der obersten Ebene erhalten. Bestehende Legacy-Felder bleiben ebenfalls erhalten und werden zusätzlich in das passende Modul gespiegelt.

## Modul- und Abschnitts-IDs

Stabile Modul-IDs:

- `pse`
- `bindungscode`
- `ionenbindung`
- `salze`
- `atombindung`
- `metallbindung`

Vorgesehene Abschnitts- und Test-IDs für spätere Erweiterungen:

- Atombindung: `atombindung`, `lewis`, `elektronegativitaet`, `reaktionsgleichungen`, `atombindung_test`
- Ionenbindung/Salze: `ionenbildung`, `ionengitter`, `salze`, `salze_test`
- Metallbindung: `metallbindung`, `metalleigenschaften`, `metall_test`

Die IDs sind technische Schlüssel und verändern keine sichtbaren Überschriften.

## Zentrale API

`js/progress.js` stellt bereit:

- `loadProgress()` – lädt und normalisiert den vollständigen Stand
- `saveProgress(progress)` – speichert einen vollständigen Stand
- `patchProgress(changes)` – ändert nur angegebene Felder
- `getModuleProgress(moduleId)` – liest ein Modul
- `setModuleProgress(moduleId, changes)` – aktualisiert ein Modul
- `setSectionProgress(moduleId, sectionId, changes)` – aktualisiert einen Abschnitt
- `setTestResult(moduleId, result)` – speichert einen Test unter `sections.test`
- `setLastPosition(position)` – speichert nur den relativen Dateinamen
- `completeMission(number, knowledge)` – schließt eine Mission ab
- `isMissionUnlocked(number)` – prüft die bestehende Missionsfreigabe
- `resetProgress()` – entfernt den lokalen Datensatz

## Migration Version 1 → Version 2

Beim ersten `loadProgress()` wird ein vorhandener Datensatz unter `chemieBindungenProgress` geprüft. Fehlt `version: 2`, wird ein neuer Version-2-Rahmen angelegt. Alle vorhandenen Legacy-Felder bleiben erhalten und werden zusätzlich in das passende Modul kopiert.

Übernommene fachbezogene Felder sind unter anderem:

- `covalentLearning`, `lewisLearning`
- `elektronegativitaetAbgeschlossen`, `reaktionsgleichungenAbgeschlossen`
- `atombindungOnlineTestBestanden`, `atombindungTestBestesErgebnis`, `atombindungAbschlussVersion`
- `metallLearning`, `metallbindungFreigeschaltet`, `metallOnlineTestBestanden`, `metallTestBestesErgebnis`, `metallAbschlussVersion`
- `arbeitsblattBindungenBestanden`
- `salzZuordnungAbgeschlossen`, `salzOnlineTestBestanden`, `salzAbschlussVersion`

Der migrierte Datensatz wird anschließend wieder unter demselben Schlüssel mit `version: 2` gespeichert. Eine erneute Migration erfolgt nicht.

## Letzte Position

`js/navigation.js` speichert beim Seitenaufruf den relativen Dateinamen, zum Beispiel `lewis.html`, in `lastPosition`. Die Navigation wird dadurch noch nicht verändert.

## Authentication – geplante Architektur

Aktuell gibt es nur einen klar gekennzeichneten DEV-Login in `js/auth.js`. Der eingegebene anonyme Schülercode wird lokal als Entwicklungsidentität gespeichert. Es werden keine Namen, E-Mail-Adressen oder Geburtsdaten erfasst.

`loginWithStudentCode()` verwendet Firebase Authentication. Der Schülercode dient nur als Zugangscode; die technische Benutzeridentität ist die von Firebase vergebene UID. Der Code wird nicht als Firestore-Dokument-ID verwendet.

Authentifizierung und Lernfortschritt bleiben getrennt: `js/auth.js` verwaltet die Identität, `js/progress.js` verwaltet den Lernstand. Die spätere Firestore-Struktur wird ausschließlich über die authentifizierte Firebase-UID geschützt.

## Kompatibilität

Die bisherigen Module verwenden weiterhin ihre bekannten Legacy-Felder. Die neue API ergänzt die Version-2-Struktur, ohne diese Felder zu entfernen. Dadurch bleiben bestehende Freischaltungen, 80-%-Regeln und Lerneditoren funktionsfähig, während die Module schrittweise auf die neue API umgestellt werden können.
