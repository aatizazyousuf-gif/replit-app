import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import devicesRouter from "./devices";
import readingsRouter from "./readings";
import alertsRouter from "./alerts";
import refillOrdersRouter from "./refill_orders";
import messagesRouter from "./messages";
import supplierRouter from "./supplier";
import homeownerRouter from "./homeowner";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(devicesRouter);
router.use(readingsRouter);
router.use(alertsRouter);
router.use(refillOrdersRouter);
router.use(messagesRouter);
router.use(supplierRouter);
router.use(homeownerRouter);

export default router;
