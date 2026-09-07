import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import connectToDatabase from './db';
import User from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_gbp_manager_2026';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword?: string): Promise<boolean> {
  if (!hashedPassword) return false;
  return bcrypt.compare(password, hashedPassword);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies JWT from HTTP-only cookie or Authorization header in API routes.
 */
export async function getAuthUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token =
      req.cookies.get('auth_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return null;

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error('getAuthUserFromRequest error:', error);
    return null;
  }
}
