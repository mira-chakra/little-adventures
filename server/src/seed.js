import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Adventure } from './models/Adventure.js';
import { seedAdventures } from './utils/seedData.js';
if(!process.env.MONGODB_URI){console.error('Set MONGODB_URI in server/.env');process.exit(1);}
try{
  await mongoose.connect(process.env.MONGODB_URI);
  let admin = await User.findOne({role:'admin'});
  if(process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD){
    if(process.env.SEED_ADMIN_PASSWORD.length<12)throw new Error('SEED_ADMIN_PASSWORD must contain 12+ characters');
    const email=process.env.SEED_ADMIN_EMAIL.toLowerCase().trim();
    const existing=await User.findOne({email});
    if(existing && existing.role!=='admin')throw new Error('Provided admin email already belongs to a standard user. Choose a new admin email.');
    admin = existing || await User.create({name:'Little Adventures Admin',email,passwordHash:await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD,12),role:'admin'});
    console.log(existing?'Existing admin kept.':'Admin account created.');
  }
  if(!admin)throw new Error('No admin exists. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD then seed again.');
  let inserted=0;
  for(const entry of seedAdventures){
    const exists=await Adventure.exists({title:entry.title});
    if(!exists){await Adventure.create({...entry,createdBy:admin._id});inserted++;}
  }
  console.log(`Seed finished: ${inserted} new adventures, ${seedAdventures.length} curated suggestions available. Existing admin data preserved.`);
}catch(e){console.error('Seed failed:',e.message);process.exitCode=1;}finally{await mongoose.disconnect();}
