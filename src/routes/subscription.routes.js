import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createSubscription,checkRegistration } from "../controllers/subscription.controller.js";
const router=Router()

router.use(verifyJWT)
router.route('/add').post(createSubscription)
router.route('/checkRegistration').post(checkRegistration)
export default router