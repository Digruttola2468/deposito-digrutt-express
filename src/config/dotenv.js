import { config } from "dotenv";

config();

//Chosse Mysql Mongoo Memory File
export const PERSISTENCE = process.env.PERSISTENCE;

//BBDD
export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT;
export const JWT_SECRET = process.env.JWT_SECRET;

// AUTH GOOGLE
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// MAIL
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
