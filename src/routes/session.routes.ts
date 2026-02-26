import { Router } from 'express'
import { createSession, getSession, getUserSessions, submitExam } from '../controllers/session.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate)
router.post('/', createSession)
router.get('/', getUserSessions)
router.get('/:id', getSession)
router.post('/:id/submit', submitExam)

export default router