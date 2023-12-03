import { Router } from "express";

const router = Router();

router.get('/mercaderia', (req,res) => {
    res.render('index');
})

export default router;