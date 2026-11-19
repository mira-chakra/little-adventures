import 'dotenv/config';
import fs from 'node:fs';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Adventure } from './models/Adventure.js';
import { adventureSchema } from './utils/validation.js';
import { missingCatalogueFields } from './utils/catalogMerge.js';
const apply=process.argv.includes('--apply');
try{
  if(!process.env.MONGODB_URI)throw new Error('Configure server/.env first.');
  const raw=JSON.parse(fs.readFileSync(new URL('../data/lebanon-catalog.json',import.meta.url),'utf8'));
  const records=raw.map(row=>adventureSchema.parse(row));
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:12000});
  const admin=await User.findOne({role:'admin'});if(!admin)throw new Error('Create the first admin with npm run seed before upgrading the catalogue.');
  let added=0,enriched=0;
  for(const record of records){
    const existing=await Adventure.findOne({title:record.title}).lean();
    if(existing){
      const patch=missingCatalogueFields(existing,record);
      if(Object.keys(patch).length){console.log(`${apply?'ENRICH':'WOULD ENRICH'}: ${record.title}`);if(apply)await Adventure.updateOne({_id:existing._id},{$set:patch},{runValidators:true});enriched++;}
    }else{console.log(`${apply?'ADD':'WOULD ADD'}: ${record.title}`);if(apply)await Adventure.create({...record,createdBy:admin._id});added++;}
  }
  console.log(`${apply?'Catalogue upgraded':'Preview only — no database changes'}: ${added} additions, ${enriched} existing records enriched. Existing IDs, favorites and edits preserved.`);
}catch(error){console.error('Catalogue upgrade failed:',error.message);process.exitCode=1;}finally{await mongoose.disconnect();}
