import { Request, Response } from 'express'
import { submitPracticeAttempt } from '../services/practice.service'
import { saveExamResponse } from '../services/exam.service'

export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const { sessionQuestionId, mode, selectedOptionIds, natResponse, timeSpentSeconds, hintsUsed = 0, isSkipped = false } = req.body

    if (mode === 'PRACTICE') {
      const result = await submitPracticeAttempt(sessionQuestionId, {
        selectedOptionIds,
        natResponse,
        timeSpentSeconds,
        hintsUsed,
        isSkipped,
      })
      return res.json({ success: true, data: result })
    }

    if (mode === 'EXAM') {
      const result = await saveExamResponse(sessionQuestionId, {
        selectedOptionIds,
        natResponse,
        timeSpentSeconds,
        isSkipped,
      })
      return res.json({ success: true, data: result })
    }

    res.status(400).json({ success: false, message: 'Invalid mode' })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}