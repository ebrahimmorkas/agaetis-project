import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const ca = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME!,
    ssl: ca ? { ca } : undefined,
  },
});
