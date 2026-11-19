import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const cookieName = 'la_session';
function getSecret() { if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters'); return process.env.JWT_SECRET; }
export const sessionCookieOptions = () => ({ httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });
export const signToken = (user) => jwt.sign({ sub: String(user._id) }, getSecret(), { expiresIn: '7d', issuer: 'little-adventures' });

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) return res.status(401).json({ error: 'Please log in first.' });
    const payload = jwt.verify(token, getSecret(), { issuer: 'little-adventures' });
    if (!/^[a-f\d]{24}$/i.test(String(payload.sub))) return res.status(401).json({ error: 'Invalid session.' });
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Account no longer exists.' });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Session expired or invalid.' });
    next(error);
  }
}
export const requireAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Administrator access required.' });
