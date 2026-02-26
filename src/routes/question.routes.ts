import { Router } from 'express'
import { getQuestions, getSubjects } from '../controllers/question.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate)
router.get('/', getQuestions)
router.get('/subjects', getSubjects)

export default router