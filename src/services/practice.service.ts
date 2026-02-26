import { PrismaClient, Difficulty } from '@prisma/client'
import { checkMCQAnswer, checkNATAnswer, calculateMarks, calculateSessionSummary } from '../utils/score.utils'


const prisma = new PrismaClient()

export const startPracticeSession = async (
  userId: string,
  config: { subjectCode?: string; difficulty?: Difficulty; questionCount: number }
) => {
  const questions = await prisma.question.findMany({
    where: {
      isActive: true,
      ...(config.subjectCode && { subject: { code: config.subjectCode } }),
      ...(config.difficulty && { difficulty: config.difficulty }),
    },
    include: { options: { orderBy: { order: 'asc' } } },
    take: config.questionCount,
    orderBy: { createdAt: 'asc' },
  })

  if (questions.length === 0) throw new Error('No questions found for the selected filters')

  const session = await prisma.session.create({
    data: {
      mode: 'PRACTICE',
      userId,
      sessionQuestions: {
        create: questions.map((q, index) => ({
          questionId: q.id,
          order: index + 1,
        })),
      },
    },
    include: {
      sessionQuestions: {
        orderBy: { order: 'asc' },
        include: {
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

  return session
}

export const submitPracticeAttempt = async (
  sessionQuestionId: string,
  data: {
    selectedOptionIds?: string[]
    natResponse?: number
    timeSpentSeconds: number
    hintsUsed: number
    isSkipped: boolean
  }
) => {

  // session question and question details

  const sq = await prisma.sessionQuestion.findUnique({
    where: { id: sessionQuestionId },
    include: {
      question: {
        include: {
          options: true,
        },
      },
      session: true,
    },
  })

  if (!sq) throw new Error('Session question not found')
  if (sq.session.status !== 'IN_PROGRESS') throw new Error('Session is not active')


  const question = sq.question
  let isCorrect = false

  if (!data.isSkipped) {
    if (question.type === 'NAT' && data.natResponse !== undefined) {
      isCorrect = checkNATAnswer(data.natResponse, question.natAnswer!)
    } else if ((question.type === 'MCQ' || question.type === 'MULTI') && data.selectedOptionIds) {
      const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id)
      isCorrect = checkMCQAnswer(data.selectedOptionIds, correctIds, question.type)
    }
  }

  const marksAwarded = calculateMarks({
    isCorrect,
    marks: question.marks,
    negativeMarks: question.negativeMarks,
    negativeMarkingEnabled: false, // practice mode: no negative marking
    isSkipped: data.isSkipped,
  })

  const attempt = await prisma.attempt.upsert({
    where: { sessionQuestionId },
    update: {
      selectedOptionIds: data.selectedOptionIds ?? [],
      natResponse: data.natResponse,
      isCorrect,
      marksAwarded,
      timeSpentSeconds: data.timeSpentSeconds,
      hintsUsed: data.hintsUsed,
      isSkipped: data.isSkipped,
    },
    create: {
      sessionQuestionId,
      selectedOptionIds: data.selectedOptionIds ?? [],
      natResponse: data.natResponse,
      isCorrect,
      marksAwarded,
      timeSpentSeconds: data.timeSpentSeconds,
      hintsUsed: data.hintsUsed,
      isSkipped: data.isSkipped,
    },
  })

  // return with answers
  const correctOptionIds = question.options.filter((o) => o.isCorrect).map((o) => o.id)

  return {
    attempt,
    isCorrect,
    marksAwarded,
    correctOptionIds,
    explanation: question.explanation,
  }
}