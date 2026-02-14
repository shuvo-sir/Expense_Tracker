import {neon} from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

// Create the SQL connection using our DB URL from the .env file
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at Date NOT NULL DEFAULT CURRENT_DATE
        )`;

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1); // Status code 1 means failure and 0 means success.
    }
}