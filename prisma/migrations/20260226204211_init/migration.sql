-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'MULTI', 'NAT');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('PRACTICE', 'EXAM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "explanation" TEXT,
    "subjectId" TEXT NOT NULL,
    "conceptId" TEXT,
    "natAnswer" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hint" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "mode" "SessionMode" NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "totalMarks" DOUBLE PRECISION,
    "negativeMarking" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "timeTakenSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sectionName" TEXT,

    CONSTRAINT "SessionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "sessionQuestionId" TEXT NOT NULL,
    "selectedOptionIds" TEXT[],
    "natResponse" DOUBLE PRECISION,
    "isCorrect" BOOLEAN,
    "marksAwarded" DOUBLE PRECISION,
    "timeSpentSeconds" INTEGER NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "isSkipped" BOOLEAN NOT NULL DEFAULT false,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "Concept_subjectId_idx" ON "Concept"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Concept_name_subjectId_key" ON "Concept"("name", "subjectId");

-- CreateIndex
CREATE INDEX "Question_subjectId_difficulty_idx" ON "Question"("subjectId", "difficulty");

-- CreateIndex
CREATE INDEX "Question_conceptId_idx" ON "Question"("conceptId");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "Option_questionId_idx" ON "Option"("questionId");

-- CreateIndex
CREATE INDEX "Hint_questionId_idx" ON "Hint"("questionId");

-- CreateIndex
CREATE INDEX "Session_userId_mode_idx" ON "Session"("userId", "mode");

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "SessionQuestion_sessionId_idx" ON "SessionQuestion"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionQuestion_sessionId_questionId_key" ON "SessionQuestion"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionQuestion_sessionId_order_key" ON "SessionQuestion"("sessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_sessionQuestionId_key" ON "Attempt"("sessionQuestionId");

-- CreateIndex
CREATE INDEX "Attempt_sessionQuestionId_idx" ON "Attempt"("sessionQuestionId");

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionQuestion" ADD CONSTRAINT "SessionQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionQuestion" ADD CONSTRAINT "SessionQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_sessionQuestionId_fkey" FOREIGN KEY ("sessionQuestionId") REFERENCES "SessionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
