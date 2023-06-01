import { createPool }  from 'mysql2/promise';
import { DB_USER, DB_DATABASE, DB_PASSWORD, DB_HOST, DB_PORT } from './config.js'

//Es equivalente a createConnection
export const con = createPool ( {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_DATABASE
} )