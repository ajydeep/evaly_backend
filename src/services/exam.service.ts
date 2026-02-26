import { PrismaClient } from '@prisma/client'
import { checkMCQAnswer, checkNATAnswer, calculateMarks, calculateSessionSummary } from '../utils/score.utils'

const prisma = new PrismaClient()

// Exam config: fixed sections with question counts
const EXAM_CONFIG = [
  { subjectCode: 'OS', sectionName: 'Operating Systems', questionCount: 5 },
  { subjectCode: 'DBMS', sectionName: 'Database Systems', questionCount: 5 },
  { subjectCode: 'ALGO', sectionName: 'Algorithms', questionCount: 4 },
  { subjectCode: 'CN', sectionName: 'Computer Networks', questionCount: 2 },

]




const EXAM_DURATION_SECONDS = 60 * 60 // 60 minutes

export const startExamSession = async (userId: string) => {
  // Build question list for each section
  const allSectionQuestions: Array<{ questionId: string; sectionName: string; order: number }> = []
  let order = 1

  for (const section of EXAM_CONFIG) {
    const questions = await prisma.question.findMany({
      where: { isActive: true, subject: { code: section.subjectCode } },
      take: section.questionCount,
      orderBy: { createdAt: 'asc' },
    })

    for (const q of questions) {
      allSectionQuestions.push({ questionId: q.id, sectionName: section.sectionName, order })
      order++
    }
  }

  if (allSectionQuestions.length === 0) throw new Error('Not enough questions to start exam')

  // Calculate total marks
  const questionIds = allSectionQuestions.map((sq) => sq.questionId)
  const questionData = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { marks: true },
  })
  const totalMarks = questionData.reduce((sum, q) => sum + q.marks, 0)

  const session = await prisma.session.create({
    data: {
      mode: 'EXAM',
      userId,
      durationSeconds: EXAM_DURATION_SECONDS,
      negativeMarking: true,
      totalMarks,
      sessionQuestions: {
        create: allSectionQuestions,
      },
    },
    include: {
      sessionQuestions: {
        orderBy: { order: 'asc' },
        include: {
          question: {
            include: {
              subject: { select: { name: true, code: true } },
             
              options: {
                orderBy: { order: 'asc' },
                select: { id: true, text: true, order: true },
              },
            },
          },
        },
      },
    },
  })

  return { session, durationSeconds: EXAM_DURATION_SECONDS, totalMarks }
}

export const saveExamResponse = async (
  sessionQuestionId: string,
  data: { selectedOptionIds?: string[]; natResponse?: number; timeSpentSeconds: number; isSkipped: boolean }
) => {
  // Only saving in exam mode, no grading
  const sq = await prisma.sessionQuestion.findUnique({
    where: { id: sessionQuestionId },
    include: { session: true },
  })

  if (!sq) throw new Error('Session question not found')
  if (sq.session.status !== 'IN_PROGRESS') throw new Error('Exam already submitted')

  await prisma.attempt.upsert({
    where: { sessionQuestionId },
    update: {
      selectedOptionIds: data.selectedOptionIds ?? [],
      natResponse: data.natResponse,
      timeSpentSeconds: data.timeSpentSeconds,
      isSkipped: data.isSkipped,
    },
    create: {
      sessionQuestionId,
      selectedOptionIds: data.selectedOptionIds ?? [],
      natResponse: data.natResponse,
      timeSpentSeconds: data.timeSpentSeconds,
      isSkipped: data.isSkipped,
    },
  })

  return { saved: true }
}

export const submitExamSession = async (sessionId: string, userId: string) => {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
    include: {
      sessionQuestions: {
        include: {
          attempt: true,
          question: {
            include: { options: true },
          },
        },
      },
    },
  })

  if (!session) throw new Error('Session not found')
  if (session.status === 'SUBMITTED') throw new Error('Session already submitted')

  // Grade all attempts
  const gradedAttempts = session.sessionQuestions.map((sq) => {
    const attempt = sq.attempt
    const question = sq.question

    if (!attempt || attempt.isSkipped) {
      return { sessionQuestionId: sq.id, isCorrect: false, marksAwarded: 0, isSkipped: true }
    }

    let isCorrect = false

    if (question.type === 'NAT' && attempt.natResponse !== null && attempt.natResponse !== undefined) {
      isCorrect = checkNATAnswer(attempt.natResponse, question.natAnswer!)
    } else if (attempt.selectedOptionIds.length > 0) {
      const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id)
      isCorrect = checkMCQAnswer(attempt.selectedOptionIds, correctIds, question.type as 'MCQ' | 'MULTI')
    }

    const marksAwarded = calculateMarks({
      isCorrect,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      negativeMarkingEnabled: true,
      isSkipped: attempt.isSkipped,
    })

    return { sessionQuestionId: sq.id, isCorrect, marksAwarded, isSkipped: false }
  })

  // Update all attempts in one transaction
  await prisma.$transaction([
    ...gradedAttempts.map(({ sessionQuestionId, isCorrect, marksAwarded }) =>
      prisma.attempt.updateMany({
        where: { sessionQuestionId },
        data: { isCorrect, marksAwarded },
      })
    ),
  ])

  const summary = calculateSessionSummary(
    gradedAttempts.map((a) => ({ marksAwarded: a.marksAwarded, isCorrect: a.isCorrect, isSkipped: a.isSkipped }))
  )

  const timeTaken = Math.floor((Date.now() - session.startedAt.getTime()) / 1000)

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      score: summary.score,
      accuracy: summary.accuracy,
      timeTakenSeconds: timeTaken,
    },
  })

  return { session: updated, summary, gradedAttempts }
}