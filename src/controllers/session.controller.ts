import { Request, Response } from 'express'
import { startPracticeSession } from '../services/practice.service'
import { startExamSession, submitExamSession } from '../services/exam.service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createSession = async (req: Request, res: Response) => {
  try {
    const { mode, subjectCode, difficulty, questionCount = 10 } = req.body
    const userId = req.user!.id

    if (mode === 'PRACTICE') {
      const session = await startPracticeSession(userId, { subjectCode, difficulty, questionCount })
      return res.status(201).json({ success: true, data: session })
    }

    if (mode === 'EXAM') {
      const result = await startExamSession(userId)
      return res.status(201).json({ success: true, data: result })
    }

    res.status(400).json({ success: false, message: 'Invalid mode. Use PRACTICE or EXAM' })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getSession = async (req: Request, res: Response) => {
  try {
    const session = await prisma.session.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        sessionQuestions: {
          orderBy: { order: 'asc' },
          include: {
            attempt: true,
            question: {
              include: {
                subject: true,
                concept: true,
                options: { orderBy: { order: 'asc' }, select: { id: true, text: true, order: true } },
                hints: { orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
    })

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' })
    res.json({ success: true, data: session })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mode: true,
        status: true,
        score: true,
        accuracy: true,
        timeTakenSeconds: true,
        startedAt: true,
        submittedAt: true,
        totalMarks: true,
        _count: { select: { sessionQuestions: true } },
      },
    })
    res.json({ success: true, data: sessions })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const submitExam = async (req: Request, res: Response) => {
  try {
    const result = await submitExamSession(req.params.id, req.user!.id)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}