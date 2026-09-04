import mysql from 'mysql2/promise';

let pool: mysql.Pool;

const poolConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'newkrm_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool(poolConfig);
} else {
  // In development, use a global variable to prevent creating new pools on hot reloads
  if (!(global as any).dbPool) {
    (global as any).dbPool = mysql.createPool(poolConfig);
  }
  pool = (global as any).dbPool;
}

/**
 * Execute a SQL query and return the rows.
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export default pool;
