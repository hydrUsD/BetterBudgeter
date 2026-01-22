# Aufgabenblatt – Transaction Import & UPSERT Pipeline (MVP)

## Ziel dieses Aufgabenblatts

Du implementierst in diesem Aufgabenblatt die **Transaction Import & UPSERT Pipeline**  
für unser Projekt **BetterBudget**.

👉 Am Ende gilt:

- Der Import funktioniert
    
- Doppelte Transaktionen werden **nicht** doppelt gespeichert
    
- Du hast **nichts kaputt gemacht**
    
- Und: Es ist **völlig okay**, wenn du nicht alles sofort verstehst
    

> 💡 **Ganz wichtig:**  
> Wenn du irgendwo nicht weiterkommst → **frag eine AI (z. B. Gemini)**.  
> Das ist **erwünscht**, nicht verboten.

---

## Voraussetzungen (bitte abhaken)

-  Projekt lokal gestartet (`bun dev`)
    
-  Du bist eingeloggt (Supabase Auth)
    
-  Mindestens eine Bank ist über `/link-bank` verbunden
    
-  Du hast die Datei `docs/IMPORT_PIPELINE_STRATEGY.md` einmal grob überflogen
    

---

## Überblick: Was du baust

```
Dashboard Button
   ↓
POST /api/import
   ↓
PSD2 Mock API
   ↓
Normalisierung
   ↓
UPSERT in DB
```

---

## Schritt 1 – Import-Endpoint öffnen

📂 **Datei öffnen:**  
`src/app/api/import/route.ts`

### Minimaler Startpunkt

```ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Import endpoint reached" });
}
```

> 🧠 **.NET-Vergleich:**  
> Das ist wie ein `HttpPost`-Controller, nur als Funktion.

---

## Schritt 2 – User prüfen (Auth)

Erweitere den Endpoint:

```ts
import { createSupabaseServerClient } from "@/lib/db/supabaseServer";

export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // hier geht es gleich weiter
}
```

> 💡 **Beruhigung:**  
> Wenn du hier einen Fehler bekommst → **normal**.

### 🤖 AI-Prompt

> „Erkläre mir diesen Supabase Auth Check in einfachen Worten. Ich komme aus .NET.“

---

## Schritt 3 – Verlinkte Banken prüfen

📂 **Hilfsfunktionen liegen hier:**  
`src/lib/db/accounts.ts`

```ts
import { getLinkedBankIds } from "@/lib/db/accounts";

const bankIds = await getLinkedBankIds(user.id);

if (bankIds.length === 0) {
  return NextResponse.json(
    { error: "No bank linked" },
    { status: 400 }
  );
}
```

> 🧠 Denkmodell:  
> Ohne Bank → kein Import → kontrolliertes Verhalten

---

## Schritt 4 – Mock-Daten holen

📂 **Mock-Logik:**  
`src/lib/mock`

```ts
import { getMockTransactions } from "@/lib/mock";

const transactions = await getMockTransactions({
  userId: user.id,
  bankIds,
});
```

> ⚠️ **Wichtig:**  
> Das UI darf diese Funktion **niemals** aufrufen – nur hier im API-Endpoint.

---

## Schritt 5 – Normalisierung

```ts
const normalized = transactions.map((tx) => ({
  user_id: user.id,
  external_id: tx.transactionId,
  amount: tx.amount,
  currency: tx.currency,
  booking_date: tx.bookingDate,
  merchant: tx.merchantName ?? null,
  category: tx.category ?? "other",
}));
```

> 💡 **Wenn hier etwas kaputtgeht:**  
> Das ist der **klassischste Fehlerpunkt** – völlig normal.

### 🤖 AI-Prompt

> „Wie mappe ich externe API-Daten sauber auf ein internes Datenmodell in TypeScript?“

---

## Schritt 6 – UPSERT in die Datenbank

```ts
const { error } = await supabase
  .from("transactions")
  .upsert(normalized, {
    onConflict: "user_id,external_id",
  });

if (error) {
  return NextResponse.json(
    { error: "Database error" },
    { status: 500 }
  );
}
```

> 🧠 **Wichtig:**  
> Keine manuelle Duplikatsprüfung – **die DB entscheidet**.

---

## Schritt 7 – Erfolg zurückgeben

```ts
return NextResponse.json({
  imported: normalized.length,
  status: "success",
});
```

---

## Schritt 8 – Import-Button im Dashboard

📂 **z. B.:**  
`src/components/dashboard/ImportButton.tsx`

```tsx
<button
  onClick={async () => {
    await fetch("/api/import", { method: "POST" });
  }}
>
  Import Transactions
</button>
```

> 🎉 Wenn das klappt, hast du **die komplette Pipeline gebaut**.

---

## Selbst-Check

-  Import funktioniert
    
-  Mehrfach klicken → keine Duplikate
    
-  App crasht nicht
    
-  Du hast mindestens **einmal** eine AI gefragt
    

---

## Zum Schluss

Du musst **nicht alles perfekt verstehen**.  
Du hast **etwas Reales gebaut**, das funktioniert.

Das ist Softwareentwicklung. 👏