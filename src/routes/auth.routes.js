import { Router } from "express";
import {createNewUser,iniciarSesion
} from "../controller/auth.controler.js";

const router = Router();

router.post("/signUp", createNewUser);

router.post("/login", iniciarSesion);


export default router;
