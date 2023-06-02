import { con } from '../db.js'

export const isConectionBBDD = async (req,res) => {
    const result = await con.query('SELECT 1 + 1 AS result');
    res.send(result);
};