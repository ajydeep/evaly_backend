import { Request, Response } from 'express'
import { PrismaClient, Difficulty, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { subjectCode, difficulty, type, limit = '10' } = req.query

    const questions = await prisma.question.findMany({
      where: {
        isActive: true,
        ...(subjectCode && { subject: { code: subjectCode as string } }),
        ...(difficulty && { difficulty: difficulty as Difficulty }),
        ...(type && { type: type as QuestionType }),
      },
      include: {
        subject: { select: { name: true, code: true } },
        concept: { select: { name: true } },
        options: { orderBy: { order: 'asc' }, select: { id: true, text: true, order: true } },
        hints: { orderBy: { order: 'asc' }, select: { id: true, text: true, order: true } },
        _count: { select: { options: true, hints: true } },
      },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'asc' },
    })

    res.json({ success: true, data: questions, count: questions.length })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        concepts: true,
        _count: { select: { questions: true } },
      },
    })
    res.json({ success: true, data: subjects })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message })
  }
}