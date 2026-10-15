import app from './app.js';
import { env } from './config/env.js';
import { checkDbConnection, pool } from './db/index.js';

async function start() {
  try {
    await checkDbConnection();
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('Could not connect to MySQL:', (err as Error).message);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
