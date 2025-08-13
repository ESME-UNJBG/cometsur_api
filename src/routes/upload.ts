import { Router } from "express";
import { getfile } from "../controller/upload";
import multerMiddleware from "../middleware/file";
import { checkjwt } from "../middleware/sesion";

const router = Router();
router.post("/", checkjwt, multerMiddleware.single("myfile"), getfile);
export { router };
