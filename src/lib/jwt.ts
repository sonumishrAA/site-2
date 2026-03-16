import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export function signCrossSiteToken(payload: {
  owner_id: string
  owner_email: string
  owner_name?: string
  owner_phone?: string
  library_id?: string
  purpose: 'renew' | 'add-library'
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}
