import express from "express";
import { sql } from "../config/db.js";
import {
    getTansactionByUserId,
    createTransactionasync,
    deleteTransaction,
    summaryTransaction

} from "../controllers/transactionController.js"


const router = express.Router();


router.get("/:userId", getTansactionByUserId );


router.post("/", createTransactionasync);


router.delete("/:id", deleteTransaction);

router.get("/summary/:userId", summaryTransaction)

export default router