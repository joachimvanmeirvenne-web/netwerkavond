# Netwerkavond inschrijving (AI-Native)

Deze webapp laat bezoekers zich zonder login inschrijven voor een event met:
- naam
- e-mail
- gsm
- studierichting
- studiejaar
- studiestad
- extra informatie (optioneel)

## AI-Native stack
- **Frontend:** vanilla HTML/CSS/JS met async API-aanroep
- **Backend:** Node.js HTTP server (zonder externe dependencies)
- **Opslag:** JSON datastore (`data/registrations.json`)
- **AI-native voorbereiding:** `aiSummary` veld wordt automatisch gevuld op basis van extra info

## Starten
```bash
npm run dev
```
Ga naar `http://localhost:3000`.
