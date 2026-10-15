# Agaetis

React + Express app written in TypeScript, backed by MySQL.

**Live:** https://agaetis.vercel.app (API: https://agaetis-api.onrender.com/api/health)

The API runs on Render's free plan, so the first request after a quiet period can take up to a minute while it wakes up.

## Structure

- `client/` – React (Vite + Tailwind) frontend
- `server/` – Express API using Drizzle ORM with MySQL

## Running locally

### Requirements

- Node 20 or newer
- MySQL 8 running locally (or any MySQL you can connect to)

### 1. Clone and install

```bash
git clone https://github.com/ebrahimmorkas/agaetis-project.git
cd agaetis-project
npm run install:all
```

`install:all` installs the root, `server` and `client` dependencies.

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Open `server/.env` and set at least:

| Variable | Value |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Your MySQL connection |
| `DB_NAME` | `agaetis` |
| `JWT_SECRET` | Any random string of 32+ characters |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | Login for the first super admin |

A quick way to get a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Create the database

```sql
CREATE DATABASE agaetis;
```

```bash
cd server
npm run db:migrate
npm run db:seed   # creates the super admin from SUPER_ADMIN_* in .env
cd ..
```

### 4. Start the app

```bash
npm run dev
```

This starts both apps together:

- Client: http://localhost:5173
- API: http://localhost:5000 (the client proxies `/api` to it)

Log in with the super admin credentials from `.env`, then create admins, managers and employees from the Users page.

### Production build

```bash
npm run build                 # builds server and client
npm start --prefix server     # runs the compiled API
```

The client build ends up in `client/dist`.

## Roles

| Role | What they can do |
| --- | --- |
| Super admin | Everything. Creates admins and picks their permissions, and is the only one who can change other users' passwords. There is only one. |
| Admin | Manages managers and employees, limited to the view / add / edit / deactivate permissions the super admin gave them. |
| Manager | Sees and edits (name and email only) the employees assigned to them. |
| Employee | Can only view and update their own profile. |

Every user can update their own name, email and password from the profile page. Users are never deleted, only deactivated, which blocks them from logging in.

## Database scripts (server)

| Script | What it does |
| --- | --- |
| `npm run db:generate` | Create a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly (handy in dev) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Create the super admin (skipped if one exists) |

## Deployment

| Part | Host | Notes |
| --- | --- | --- |
| Database | Aiven (free MySQL) | Requires SSL. The CA certificate goes in `DB_SSL_CA`. |
| API | Render (free web service) | Root `server`, build `npm install --include=dev && npm run build`, start `npm start`, health check `/api/health` |
| Client | Vercel | Root `client`. `client/vercel.json` forwards `/api/*` to the Render API, so the auth cookie stays on the same domain. |

Render environment variables: `NODE_ENV=production`, the `DB_*` values, `DB_SSL_CA`, `JWT_SECRET`, `TRUST_PROXY=2` (Vercel and Render both sit in front of the API) and `CLIENT_URL` set to the Vercel URL.

To run migrations against the hosted database, put its values in `server/.env` (including `DB_SSL_CA`) and run `npm run db:migrate` from `server`.

An UptimeRobot monitor calls `/api/health` every 5 minutes. That keeps the Render service awake, and because the health check pings the database, it also stops the free Aiven database from powering off.
