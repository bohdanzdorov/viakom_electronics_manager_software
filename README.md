# Viakom Electronics Manager

Viakom Electronics Manager is a B2B sourcing and data aggregation application for Viakom Electronics. The application is still evolving, but managers already use it to speed up market research for electronic component purchasing.

The tool replaces a manual process that previously required a manager to check distributor websites one by one for every component and could take two to three hours. It accepts component lists in the format in which they arrive, extracts the searchable part information, queries multiple distributors, and presents the available prices and stock in one dashboard.

## Features

- Upload component lists as Excel (`.xlsx` or `.xls`) or PDF files.
- Paste unstructured text from an email or other message directly into the application.
- Use an LLM to extract part numbers and quantities from plain text while ignoring unrelated message content.
- Search Mouser, TME, and DigiKey for each extracted component.
- Compare stock, unit price, manufacturer, and product links across providers.
- Apply manager-configurable provider coefficients to displayed prices.
- Convert adjusted prices to Ukrainian hryvnia using the National Bank of Ukraine USD exchange rate.
- Cache the exchange rate in memory and refresh it daily, with fallback behavior when the NBU service is unavailable.
- Run a health check endpoint for local and CI smoke tests.

The typical workflow reduces a two-to-three-hour manual task to seconds for structured files and a few minutes for text extraction and distributor searches, depending on provider response times.

## Deployment

The webpage is deployed at [https://viakom-electronics-managers-software.netlify.app/](https://viakom-electronics-managers-software.netlify.app/)

## Current status

This project is in active development and is used internally. The following items are not complete yet:

- PDF and Excel export controls are currently placeholders in the frontend.
- The backend export endpoint currently returns `501 Not Implemented`.
- The current dashboard shows unit prices, coefficient-adjusted prices, and UAH values. VAT-inclusive totals and complete order totals are planned dashboard capabilities, not currently implemented in the codebase.
- Distributor credentials are optional at startup. A provider without credentials returns an explanatory error value for its results instead of preventing the other providers from responding.

## Architecture

```text
React + Vite frontend :8080
          |
          | HTTP / JSON and multipart upload
          v
Node.js + Express backend :3000
  |-- Excel/PDF parsers
  |-- Groq text extraction
  |-- Mouser, TME, and DigiKey integrations
  |-- NBU exchange-rate integration
  `-- coefficients.json persistence
```

The frontend is built as static files and served by Nginx in the production container. The backend runs as a Node.js process and stores uploaded files temporarily in `backend/uploads/`; processed uploads are removed after parsing.

## Repository structure

```text
.
|-- backend/
|   |-- index.js                  Express application and scheduled jobs
|   |-- src/controllers/          HTTP request handlers
|   |-- src/routers/              API route definitions
|   |-- src/services/             Parsers and distributor integrations
|   |-- coefficients.json         Provider coefficient settings
|   |-- .example.env              Environment variable template
|   `-- Dockerfile
|-- frontend/
|   |-- src/                     React application and UI components
|   |-- nginx.conf               Production static-file server config
|   `-- Dockerfile
|-- .github/workflows/ci.yml     CI and Docker smoke test
|-- docker-compose.yml
`-- uploads/                     Repository-level upload directory
```

## Requirements

- Node.js 20 or newer
- npm
- Docker and Docker Compose for the containerized setup
- API credentials for the providers and LLM features you want to use

## Configuration

Create the backend environment file from the supplied template:

```powershell
Copy-Item backend/.example.env backend/.env
```

Then set the values in `backend/.env`:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port; defaults to `3000` |
| `GROQ_API_KEY` | Groq API key used for plain-text component extraction |
| `MOUSER_API_KEY` | Mouser search API key |
| `TME_TOKEN` | TME API token |
| `TME_APP_SECRET` | TME API signing secret |
| `DIGIKEY_CLIENT_ID` | DigiKey OAuth client ID |
| `DIGIKEY_CLIENT_SECRET` | DigiKey OAuth client secret |

The template also contains legacy or provider-specific fields such as `MOUSER_USERNAME`, `MOUSER_PROJECT_NAME`, and `DIGIKEY_CALLBACK_URL`. Keep credentials out of source control. The backend `.gitignore` excludes `.env` files.

The frontend reads `VITE_API_URL` at build time. It defaults to `http://localhost:3000` when unset.

## Run with Docker Compose

Docker Compose builds both services and exposes the application at `http://localhost:8080`:

```powershell
Copy-Item backend/.example.env backend/.env
# Edit backend/.env and add the required credentials.
docker compose up --build
```

Useful commands:

```powershell
docker compose up -d --build
docker compose logs -f
docker compose down
```

The backend health check is available at `http://localhost:3000/api/health`.

## Run locally without Docker

Install dependencies in each application directory:

```powershell
Set-Location backend
npm ci
npm run dev
```

In a second terminal:

```powershell
Set-Location frontend
npm ci
npm run dev
```

Vite prints the frontend development URL, usually `http://localhost:5173`. The frontend uses `VITE_API_URL` when provided; otherwise it calls the backend at `http://localhost:3000`.

For a production-style frontend build:

```powershell
Set-Location frontend
npm run lint
npm run build
npm run preview
```

The backend currently exposes `start` and `dev` scripts but does not define automated unit tests. Running `npm test --if-present` is therefore a no-op locally and in CI until backend tests are added.

## API

All backend endpoints are served from port `3000` by default.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Returns a basic server health response. |
| `POST` | `/api/components/upload` | Accepts a multipart form with a `file` field, parses Excel or PDF input, and searches all configured providers. |
| `POST` | `/api/components/parse-text` | Accepts JSON such as `{ "text": "..." }`, extracts components with Groq, and searches all configured providers. |
| `POST` | `/api/components/export` | Reserved for export functionality; currently returns `501`. |
| `GET` | `/api/coefficients` | Returns the provider coefficients. |
| `POST` | `/api/coefficients` | Persists updated provider coefficients to `backend/coefficients.json`. |
| `GET` | `/api/exchange-rate` | Returns the cached or freshly fetched USD-to-UAH rate from the NBU. |

Excel input expects the first worksheet to contain a header row, with the component name or MPN in column A and the quantity in column B. PDF input is passed to the PDF parser. Plain text extraction returns normalized component objects with a `name` and positive `quantity`; if no quantity is found, it defaults to `1`.

## CI

GitHub Actions runs on pushes to `main` and on pull requests. The workflow:

1. Installs dependencies with Node.js 20.
2. Runs backend tests when a test script exists.
3. Runs the frontend ESLint check and production build.
4. Builds and starts the Docker Compose stack.
5. Checks the backend health endpoint and confirms that the frontend serves the application shell.

The Docker smoke test supplies a dummy Groq key so the stack can boot without exposing real credentials. Distributor API calls are not required for the smoke test.

## Security and operations notes

- Never commit `backend/.env` or provider credentials.
- Provider APIs are called from the backend, so credentials are not exposed to the browser.
- Exchange rates and provider OAuth tokens are held in process memory and are lost when the backend restarts.
- The application currently enables CORS globally; deployment environments should place it behind an appropriate network boundary and tighten CORS policy when public access is required.

## License

This project is proprietary to Bohdan Zdorovets. All rights reserved.
