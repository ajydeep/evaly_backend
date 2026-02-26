// Calculate marks for a single attempt
export const calculateMarks = ({
  isCorrect,
  marks,
  negativeMarks,
  negativeMarkingEnabled,
  isSkipped,
}: {
  isCorrect: boolean
  marks: number
  negativeMarks: number
  negativeMarkingEnabled: boolean
  isSkipped: boolean
}): number => {
  if (isSkipped) return 0
  if (isCorrect) return marks
  if (negativeMarkingEnabled) return -negativeMarks
  return 0
}




// MCQ/MULTI
export const checkMCQAnswer = (
  selectedOptionIds: string[],
  correctOptionIds: string[],
  type: 'MCQ' | 'MULTI'
): boolean => {
  if (type === 'MCQ') {
    return selectedOptionIds.length === 1 && selectedOptionIds[0] === correctOptionIds[0]
  }
  // MULTI
  if (selectedOptionIds.length !== correctOptionIds.length) return false
  return selectedOptionIds.sort().join(',') === correctOptionIds.sort().join(',')
}

// NAT
export const checkNATAnswer = (response: number, correct: number): boolean => {
  return Math.abs(response - correct) < 0.001
}



export const calculateSessionSummary = (
  attempts: Array<{ marksAwarded: number | null; isCorrect: boolean | null; isSkipped: boolean }>
) => {
  const total = attempts.length
  const attempted = attempts.filter((a) => !a.isSkipped).length
  const correct = attempts.filter((a) => a.isCorrect === true).length
  const score = attempts.reduce((sum, a) => sum + (a.marksAwarded ?? 0), 0)
  const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0

  return { total, attempted, correct, score, accuracy: Math.round(accuracy * 100) / 100 }
}