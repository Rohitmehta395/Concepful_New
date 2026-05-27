import { Router, type IRouter } from "express";
import healthRouter from "./health";
import onboardingRouter from "./onboarding";
import companiesRouter from "./companies";
import plansRouter from "./plans";
import requestsRouter from "./requests";
import workRouter from "./work";
import brandRouter from "./brand";
import aiProfilesRouter from "./aiProfiles";
import brandCheckRouter from "./brandCheck";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(onboardingRouter);
router.use(companiesRouter);
router.use(plansRouter);
router.use(requestsRouter);
router.use(workRouter);
router.use(brandRouter);
router.use(aiProfilesRouter);
router.use(brandCheckRouter);
router.use(adminRouter);

export default router;
