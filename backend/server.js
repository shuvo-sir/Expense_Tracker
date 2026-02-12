import express from 'express';
import dotenv from 'dotenv';
import {sql} from './config/db.js';
dotenv.config();

const app = express();

// middleware
app.use(express.json())

const PORT = process.env.PORT || 5001;

async function initDB() {
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

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    const result = await sql`
      DELETE FROM transactions WHERE id = ${idNum} RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction failed:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});


app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !category || !user_id || amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await sql`
      INSERT INTO transactions (user_id, title, amount, category)
      VALUES (${user_id}, ${title}, ${amount}, ${category})
      RETURNING *
    `;

    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error("Create transaction failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


initDB().then(() => {
    app.listen(PORT,() =>{
    console.log(`Server is running on port: ${PORT}`);
});
})
