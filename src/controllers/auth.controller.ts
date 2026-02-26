import { Request, Response } from 'express'
import { z } from 'zod'
import { registerUser, loginUser } from '../services/auth.service'


const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body)
    const result = await registerUser(name, email, password)
    res.status(201).json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const result = await loginUser(email, password)
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message })
  }
}

export const getMe = async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user })
}