import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  '';

export const sql = neon(connectionString);
