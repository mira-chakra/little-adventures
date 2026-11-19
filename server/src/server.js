import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
const port=Number(process.env.PORT)||5000;
if(!process.env.MONGODB_URI){console.error('Missing MONGODB_URI. Copy server/.env.example to server/.env and configure MongoDB Atlas.');process.exit(1);}
if(!process.env.JWT_SECRET || process.env.JWT_SECRET.length<32){console.error('Missing/weak JWT_SECRET (minimum 32 characters).');process.exit(1);}
try{
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:12000});
  console.log('MongoDB connected.');
  app.listen(port,()=>console.log(`Little Adventures running at http://localhost:${port}`));
}catch(error){console.error('Unable to connect to MongoDB:',error.message);process.exit(1);}
