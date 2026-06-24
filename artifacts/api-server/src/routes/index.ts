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
import { requireAdmin } from "../middleware/admin-auth";
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

// Protect only the new CMS admin routes; leave legacy /admin/stats and /admin/mrr open
// to avoid breaking the generated hooks which do not send x-admin-token.
router.use((req, res, next) => {
  const isProtected =
    req.path.startsWith("/admin/portfolio") ||
    req.path.startsWith("/admin/blog") ||
    req.path.startsWith("/admin/crm");
  if (isProtected) return requireAdmin(req, res, next);
  next();
});

router.use(adminRouter);
router.use(portfolioRouter);
router.use(blogRouter);
router.use(crmRouter);
router.use(stripeRouter);
router.use(storageRouter);
router.use(figmaRouter);

export default router;
