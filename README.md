# RateFlow — Real-Time Currency Converter

A clean, fast currency converter with 30-day trend charts, saved favorite pairs,
and a Travel Budgeting mode that converts one amount into five major currencies
in a single API call.

- **Frontend:** React 18 + Vite, Tailwind CSS, Recharts
- **Backend:** Node.js + Express
- **Database:** SQLite (`better-sqlite3`)
- **Live rates:** [ExchangeRate-API](https://www.exchangerate-api.com/)
- **Historical trends:** [Frankfurter](https://frankfurter.dev/) (key-less, ECB-based)

The ExchangeRate API key lives only on the backend (`server/.env`) and is never
exposed to the browser. The frontend talks to the Express API, which proxies and
caches all external rate calls.

## Project structure

```
currency-converter/
├── server/            # Express API + SQLite
│   ├── db/database.js         # SQLite init + schema
│   ├── routes/                # rates, convert, favorites, history
│   ├── services/              # exchangeRateService (caching), frankfurterService (history)
│   ├── server.js
│   └── .env.example
└── client/            # React + Vite app
    └── src/
        ├── components/        # UI components
        ├── context/           # CurrencyContext
        ├── hooks/             # useConversion, useHistory, useFavorites, useDebounce
        ├── api/client.js      # fetch wrapper for backend calls
        └── data/currencies.js # ISO currency list + travel targets
```

## Prerequisites

- Node.js 18+ (needed for `better-sqlite3` prebuilt binaries and `--watch`)
- An ExchangeRate-API key (free tier works): https://www.exchangerate-api.com/

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env          # then set EXCHANGE_API_KEY in .env
npm install
npm start                     # http://localhost:4000
```

`.env` keys:

| Key                | Description                        | Default |
| ------------------ | ---------------------------------- | ------- |
| `EXCHANGE_API_KEY` | Your ExchangeRate-API key          | —       |
| `PORT`             | Port the Express server listens on | `4000`  |

The SQLite database is created automatically at `server/data/rateflow.sqlite`.

### 2. Frontend

```bash
cd client
npm install
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:4000`, so run both the
server and client together during development. Open http://localhost:5173.

To build for production: `npm run build` (output in `client/dist`).

## How it works

### Caching
`GET /api/rates` and both convert endpoints check the `rate_cache` table first.
Rates are re-fetched from ExchangeRate-API at most once every **15 minutes** per
base currency; otherwise the cached rate map is reused.

### History / trend chart
The 30-day trend chart is powered by the free, key-less
[Frankfurter](https://frankfurter.dev/) time-series API (European Central Bank
reference rates). `GET /api/history` fetches real daily rates for the selected
pair over the last N days and caches the result server-side for 6 hours.

Because Frankfurter is ECB-based, it covers ~30 major currencies and returns
business days only (no weekends/holidays). Pairs it doesn't support return an
empty series, and the chart shows an "unavailable / building" state rather than
erroring.

### Travel Budgeting
`POST /api/convert/multi` fetches all rates for the base currency in a **single**
external call, then computes conversions for the five configured targets. Change
the default list in `client/src/data/currencies.js` (`TRAVEL_TARGETS`).

## API reference

| Method   | Endpoint                                  | Description                              |
| -------- | ----------------------------------------- | ---------------------------------------- |
| `GET`    | `/api/rates?base=USD&target=INR`          | Current rate (cached, records history)   |
| `POST`   | `/api/convert`                            | `{ base, target, amount }` → converted   |
| `POST`   | `/api/convert/multi`                      | `{ base, amount, targets[] }` → 5 rates  |
| `GET`    | `/api/history?base=USD&target=INR&days=30`| Daily rate points for a pair             |
| `GET`    | `/api/favorites`                          | List saved pairs                         |
| `POST`   | `/api/favorites`                          | `{ base, target }` → save (dedup)        |
| `DELETE` | `/api/favorites/:id`                      | Remove a favorite                        |
| `GET`    | `/api/health`                             | Health check                             |

## Notes

- Favorites persist in SQLite, not localStorage — they survive reloads.
- Errors from ExchangeRate-API (rate limit, invalid currency, network/timeout)
  are surfaced as JSON with appropriate status codes and shown inline in the UI.
- The UI is mobile-first: selectors stack vertically on small screens.
```
