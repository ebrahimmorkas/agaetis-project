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
npm run db:seed   # creates the super admin from SUPER_ADMIN_* in .env
```

Then start both apps from the root:

```bash
npm run dev
```

The client runs on http://localhost:5173 and proxies `/api` requests to the server on port 5000.

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
