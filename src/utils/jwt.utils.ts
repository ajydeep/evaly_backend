import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!

export const signToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): { id: string; email: string; role: string } => {
  return jwt.verify(token, SECRET) as { id: string; email: string; role: string }
}