import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User, publicUser } from '../models/User.js';
import { loginSchema, registerSchema } from '../utils/validation.js';
import { validate } from '../middleware/validate.js';
import { cookieName, requireAuth, sessionCookieOptions, signToken } from '../middleware/auth.js';
const router = Router();
router.post('/register', validate(registerSchema), async (req,res,next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.exists({ email })) return res.status(409).json({ error: 'Email is already registered.' });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'user' });
    res.cookie(cookieName, signToken(user), sessionCookieOptions());
    res.status(201).json({ user: publicUser(user) });
  } catch(e) { next(e); }
});
router.post('/login', validate(loginSchema), async(req,res,next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
    const valid = user && await bcrypt.compare(req.body.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect email or password.' });
    res.cookie(cookieName, signToken(user), sessionCookieOptions());
    res.json({ user: publicUser(user) });
  } catch(e) { next(e); }
});
router.post('/logout', (_req,res) => {
  res.clearCookie(cookieName, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  res.json({ message: 'Logged out.' });
});
router.get('/me', requireAuth, (req,res) => res.json({ user: publicUser(req.user) }));
export default router;
