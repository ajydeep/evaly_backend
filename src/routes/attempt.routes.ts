import { Router } from 'express'
import { submitAttempt } from '../controllers/attempt.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate)
router.post('/', submitAttempt)

export default router