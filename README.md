# Agaetis

React + Express app written in TypeScript, backed by MySQL.

## Structure

- `client/` – React (Vite) frontend
- `server/` – Express API

## Getting started

```bash
npm run install:all
cp server/.env.example server/.env   # then fill in your values
npm run dev
```

The client runs on http://localhost:5173 and proxies `/api` requests to the server on port 5000.
