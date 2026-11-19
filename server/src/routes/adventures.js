import { Router } from 'express';
import { Adventure } from '../models/Adventure.js';
import { Favorite } from '../models/Favorite.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adventureSchema, filterSchema, idSchema, updateAdventureSchema, recommendSchema, importSchema, weatherQuerySchema } from '../utils/validation.js';
import { rankAdventures } from '../utils/recommend.js';
import { forecasts, todayBeirut, validForecastDate } from '../utils/weather.js';
const router=Router();const admin=[requireAuth,requireAdmin];
const validId=(req,res,next)=>idSchema.safeParse(req.params.id).success?next():res.status(400).json({error:'Invalid adventure ID.'});
const publicFilter={status:{$in:['published',null]}};
const escapeRegex=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
async function list(req,res,next,manage=false){try{
  const {q,region,mood,maxCost,maxMinutes,category,environment,difficulty,page,limit}=req.query;
  const filter=manage?{}:{...publicFilter};
  for(const [key,value] of Object.entries({region,category,environment,difficulty}))if(value)filter[key]=value;
  if(mood)filter.moods=mood;
  if(maxCost!==undefined){filter.estimatedCost={$lte:maxCost};filter.costStatus={$ne:'unknown'};}
  if(maxMinutes!==undefined)filter.durationMinutes={$lte:maxMinutes};
  if(q){const exp=new RegExp(escapeRegex(q),'i');filter.$or=['title','location','region','description','district'].map(key=>({[key]:exp}));}
  const [adventures,total]=await Promise.all([Adventure.find(filter).sort({title:1,_id:1}).skip((page-1)*limit).limit(limit).lean(),Adventure.countDocuments(filter)]);
  if(!manage)adventures.forEach(a=>{delete a.submittedBy;delete a.reviewReason;delete a.reviewedBy;delete a.reviewedAt;});
  res.json({adventures,total,page,pages:Math.ceil(total/limit)});
}catch(e){next(e);}}
router.get('/',validate(filterSchema,'query'),(req,res,next)=>list(req,res,next));
router.get('/manage',...admin,validate(filterSchema,'query'),(req,res,next)=>list(req,res,next,true));
router.get('/options',async(req,res,next)=>{try{res.json({regions:(await Adventure.distinct('region',publicFilter)).sort()});}catch(e){next(e);}});
router.post('/import',...admin,validate(importSchema),async(req,res,next)=>{try{
  const {records,dryRun}=req.body;const seen=new Set();const preview=[];let inserted=0;
  for(const [index,record] of records.entries()){
    const key=`${record.title.toLowerCase()}|${record.location.toLowerCase()}`;
    const duplicate=seen.has(key)||await Adventure.exists({title:new RegExp(`^${escapeRegex(record.title)}$`,'i'),location:new RegExp(`^${escapeRegex(record.location)}$`,'i')});
    seen.add(key);preview.push({row:index+1,title:record.title,action:duplicate?'skip duplicate':'create draft'});
    if(!dryRun&&!duplicate){await Adventure.create({...record,status:'draft',createdBy:req.user._id});inserted++;}
  }
  res.json({dryRun,inserted,preview,message:dryRun?'Review before importing.':'Imported as drafts. Review photos and details before publishing.'});
}catch(e){next(e);}});
router.post('/recommend',validate(recommendSchema),async(req,res,next)=>{try{
  const preferences=req.body;
  if(preferences.useWeather&&!validForecastDate(preferences.date||todayBeirut()))return res.status(400).json({error:'Weather is available for today and the next six days only.'});
  const candidates=await Adventure.find({...publicFilter,estimatedCost:{$lte:preferences.budget},durationMinutes:{$lte:preferences.availableMinutes},costStatus:{$ne:'unknown'}}).lean();
  candidates.forEach(a=>{delete a.submittedBy;delete a.reviewReason;delete a.reviewedBy;delete a.reviewedAt;});
  let ranked=rankAdventures(candidates,preferences);
  if(preferences.useWeather){const weather=await forecasts(ranked,preferences.date);ranked=rankAdventures(ranked.map(item=>({...item,weather:weather.get(String(item._id))||{available:false}})),preferences);}
  const start=(preferences.page-1)*preferences.limit;
  res.json({recommendations:ranked.slice(start,start+preferences.limit),totalMatches:ranked.length,page:preferences.page,pages:Math.ceil(ranked.length/preferences.limit)});
}catch(e){next(e);}});
router.get('/:id/weather',validId,validate(weatherQuerySchema,'query'),async(req,res,next)=>{try{
  const item=await Adventure.findOne({_id:req.params.id,...publicFilter}).lean();if(!item)return res.status(404).json({error:'Adventure not found.'});
  const date=req.query.date||todayBeirut();
  if(!validForecastDate(date))return res.status(400).json({error:'Choose today or one of the next six days.'});
  const result=await forecasts([item],date);
  res.json({weather:result.get(String(item._id))||{available:false,message:Number.isFinite(item.latitude)&&Number.isFinite(item.longitude)?'Weather provider unavailable. Try again later.':'Coordinates have not been added for this place.'}});
}catch(e){next(e);}});
router.get('/manage/:id',...admin,validId,async(req,res,next)=>{try{const adventure=await Adventure.findById(req.params.id).lean();if(!adventure)return res.status(404).json({error:'Adventure not found.'});res.json({adventure});}catch(e){next(e);}});
router.get('/:id',validId,async(req,res,next)=>{try{const adventure=await Adventure.findOne({_id:req.params.id,...publicFilter}).lean();if(!adventure)return res.status(404).json({error:'Adventure not found.'});delete adventure.submittedBy;delete adventure.reviewReason;delete adventure.reviewedBy;delete adventure.reviewedAt;res.json({adventure});}catch(e){next(e);}});
router.post('/',...admin,validate(adventureSchema),async(req,res,next)=>{try{const adventure=await Adventure.create({...req.body,createdBy:req.user._id});res.status(201).json({adventure});}catch(e){next(e);}});
router.patch('/:id',...admin,validId,validate(updateAdventureSchema),async(req,res,next)=>{try{const adventure=await Adventure.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true,runValidators:true});if(!adventure)return res.status(404).json({error:'Adventure not found.'});res.json({adventure});}catch(e){next(e);}});
router.delete('/:id',...admin,validId,async(req,res,next)=>{try{const adventure=await Adventure.findByIdAndDelete(req.params.id);if(!adventure)return res.status(404).json({error:'Adventure not found.'});await Favorite.deleteMany({adventure:req.params.id});res.json({message:'Adventure deleted.'});}catch(e){next(e);}});
export default router;
