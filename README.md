# Agaetis

React + Express app written in TypeScript, backed by MySQL.

## Structure

- `client/` – React (Vite + Tailwind) frontend
- `server/` – Express API using Drizzle ORM with MySQL

## Getting started

You'll need Node 20+ and a running MySQL server.

```bash
npm run install:all
cp server/.env.example server/.env   # fill in your DB credentials
```

Create the database and run the migrations:

```sql
CREATE DATABASE agaetis;
```

```bash
cd server
npm run db:migrate
```

Then start both apps from the root:

```bash
npm run dev
```

The client runs on http://localhost:5173 and proxies `/api` requests to the server on port 5000.

## Database scripts (server)

| Script | What it does |
| --- | --- |
| `npm run db:generate` | Create a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly (handy in dev) |
| `npm run db:studio` | Open Drizzle Studio |
