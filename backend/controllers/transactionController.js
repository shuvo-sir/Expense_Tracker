import { sql } from "../config/db.js";


export async function getTansactionByUserId (req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const transactions = await sql`
      SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
    `;

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Fetch transactions failed:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export async function createTransactionasync (req, res) {
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
};

export async function deleteTransaction (req, res) {
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
};

export async function summaryTransaction(req, res) {
  try {
    const {userId} = req.params;

    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS balance
      FROM transactions
      WHERE user_id = ${userId}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income
      FROM transactions
      WHERE user_id = ${userId} AND amount > 0
    `;

    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expenses
      FROM transactions
      WHERE user_id = ${userId} AND amount < 0
    `;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    })
  } catch (error) {
    console.error("Create summery transactions failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};