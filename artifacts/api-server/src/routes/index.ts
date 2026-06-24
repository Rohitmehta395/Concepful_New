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
import portfolioRouter from "./portfolio";
import blogRouter from "./blog";
import crmRouter from "./crm";
import stripeRouter from "./stripe";
import storageRouter from "./storage";
import figmaRouter from "./figma";

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
router.use(portfolioRouter);
router.use(blogRouter);
router.use(crmRouter);
router.use(stripeRouter);
router.use(storageRouter);
router.use(figmaRouter);

export default router;
