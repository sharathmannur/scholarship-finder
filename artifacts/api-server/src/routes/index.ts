import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scholarshipsRouter from "./scholarships";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scholarshipsRouter);

export default router;
