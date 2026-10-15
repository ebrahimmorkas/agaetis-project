import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import * as schema from './schema/index.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 10,
  timezone: 'Z',
  // env vars often store the certificate with literal \n instead of line breaks
  ssl: env.DB_SSL_CA ? { ca: env.DB_SSL_CA.replace(/\\n/g, '\n') } : undefined,
});

// Drizzle reads timestamps back as UTC, so the session has to write them in UTC too
pool.pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

export const db = drizzle(pool, { schema, mode: 'default' });

export async function checkDbConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}
