import submissionsRoutes from './routes/submissions.js';
import historyRoutes from './routes/history.js';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import adventuresRoutes from './routes/adventures.js';
import favoritesRoutes from './routes/favorites.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';
import { Adventure } from './models/Adventure.js';
import { User } from './models/User.js';
import { Favorite } from './models/Favorite.js';
const app = express();
if(process.env.NODE_ENV==='production')app.set('trust proxy',1);
app.disable('x-powered-by');
app.use(helmet({
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"]
  }}
}));
app.use(express.json({limit:'1mb'}));
app.use(cookieParser());
app.use('/api', rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:'draft-7',legacyHeaders:false}));
// Cookies are SameSite=Lax and every state-changing API call requires a custom header
// and JSON content type. Cross-origin sites cannot send this header without a CORS preflight.
// No CORS policy is enabled; production uses same-origin hosting.
app.use('/api',(req,res,next)=>{
  if(!['POST','PUT','PATCH','DELETE'].includes(req.method))return next();
  if(req.get('X-Requested-With')!=='LittleAdventures')return res.status(403).json({error:'Request verification failed.'});
  if(!req.is('application/json'))return res.status(415).json({error:'Use application/json.'});
  next();
});
app.get('/api/health',(_req,res)=>res.json({status:'ok',app:'Little Adventures'}));
const loginLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many attempts. Try again later.'}});
app.use('/api/auth/login',loginLimiter);
app.use('/api/auth/register',loginLimiter);
app.use('/api/auth',authRoutes);
app.use('/api/adventures',adventuresRoutes);
app.use('/api/favorites',favoritesRoutes);
app.use('/api/submissions',submissionsRoutes);
app.use('/api/history',historyRoutes);
app.get('/api/admin/stats',requireAuth,requireAdmin,async(req,res,next)=>{
  try{const [adventures,users,favorites]=await Promise.all([Adventure.countDocuments(),User.countDocuments(),Favorite.countDocuments()]);res.json({adventures,users,favorites});}catch(e){next(e);}
});
app.use('/api',(_req,res)=>res.status(404).json({error:'API endpoint not found.'}));
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const dist=path.resolve(__dirname,'../../client/dist');
if(fs.existsSync(path.join(dist,'index.html'))){
  app.use(express.static(dist, {index:false,immutable:false}));
  app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
}
app.use((error,_req,res,_next)=>{
  if(error?.code===11000)return res.status(409).json({error:'This record already exists.'});
  if(error?.name==='ValidationError'||error?.name==='CastError')return res.status(400).json({error:'Invalid data.'});
  if(error?.type==='entity.too.large')return res.status(413).json({error:'Request too large.'});
  if(error instanceof SyntaxError && error?.status===400)return res.status(400).json({error:'Invalid JSON.'});
  console.error('Unhandled API error:',error);
  return res.status(500).json({error:'Something went wrong. Please try again.'});
});
export default app;
