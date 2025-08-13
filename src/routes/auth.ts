import { Router, Request, Response } from "express";
import { registerCrtl, loginCrtl } from "../controller/auth";
const router = Router();
/**http://localhot:3002/auth/register */
router.post("/register", registerCrtl);
router.post("/login", loginCrtl);
export { router };
