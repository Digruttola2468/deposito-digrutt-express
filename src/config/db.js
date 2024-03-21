import { createPool }  from 'mysql2/promise';
import { DB_USER, DB_DATABASE, DB_PASSWORD, DB_HOST, DB_PORT } from './dotenv.js'

//Es equivalente a createConnection
export default createPool ( {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_DATABASE
} )