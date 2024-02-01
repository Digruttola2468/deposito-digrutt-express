import {config} from 'dotenv'

config();

export const ORIGIN_WEB = process.env.ORIGIN_WEB;

//BBDD
export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT;
export const JWT_SECRET = process.env.JWT_SECRET;

//Supabase
export const SUPABASE_KEY = process.env.SUPABASE_KEY;

//Cloudinary
export const CLOUDINARY_APIKEY = process.env.CLOUDINARY_APIKEY;
export const CLOUDINARY_APISECRET = process.env.CLOUDINARY_APISECRET;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET