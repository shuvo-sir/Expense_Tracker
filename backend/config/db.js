import {neon} from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

// Create the SQL connection using our DB URL from the .env file
export const sql = neon(process.env.DATABASE_URL);