import { Router } from "express";
import { con } from '../db.js'

const router = Router();

router.get('/ping' , async (req,res) => {
    const result = await con.query('SELECT 1 + 1 AS result');
    res.send(result);
});

export default router;