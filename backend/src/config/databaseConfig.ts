/**
 * Подключение към БД и export на инстанция - hostname, port и др (DR2)
 */
import pg from 'pg';
import { DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD } from "@config/envConfig";

console.log('DB_NAME:', DB_NAME);
console.log('DB_HOST:', DB_HOST);
console.log('DB_PORT:', DB_PORT);
console.log('DB_USER:', DB_USER);

const pool = new pg.Pool({
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    max: 40,
    connectionTimeoutMillis: 10000,
});

export default pool
