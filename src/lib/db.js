/**
 * Marketing SQL Server database (server only): Client_mail_list (registered client e-mails) and
 * marketing_campaign (campaign sign-ups such as the Margin Bonus).
 * Env: DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_DATABASE.
 */
import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  options: { encrypt: true, trustServerCertificate: false } // Azure SQL
};

// one pool per server process, reused across requests (kept on `global` so dev reloads don't leak pools)
function pool() {
  global.__gtcDbPool ??= new sql.ConnectionPool(config).connect().catch((err) => {
    global.__gtcDbPool = undefined;
    throw new Error(`Database connection failed: ${err.message}`);
  });
  return global.__gtcDbPool;
}

/** Runs `text` with named parameters (`@email` ← params.email) and returns the rows. */
export async function query(text, params = {}) {
  const request = (await pool()).request();
  for (const [name, value] of Object.entries(params)) request.input(name, value);
  return (await request.query(text)).recordset ?? [];
}
