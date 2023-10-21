import { Router } from "express";
import {iniciarSesion
} from "../controller/auth.controler.js";

const router = Router();

router.get("/login", iniciarSesion);

export default router;
