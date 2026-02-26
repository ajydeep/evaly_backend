import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signToken } from '../utils/jwt.utils'


const prisma = new PrismaClient()

export const registerUser = async (name: string, email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already registered')

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, role: true },
  })

  const token = signToken({ id: user.id, email: user.email, role: user.role })
  return { user, token }
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Invalid email or password')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Invalid email or password')

  const token = signToken({ id: user.id, email: user.email, role: user.role })
  const { password: _, ...safeUser } = user
  return { user: safeUser, token }
}