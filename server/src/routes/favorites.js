import { Router } from 'express';
import { Adventure } from '../models/Adventure.js';
import { Favorite } from '../models/Favorite.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { favoriteUpdateSchema, idSchema } from '../utils/validation.js';
const router=Router();
router.use(requireAuth);
const validId=(req,res,next)=>idSchema.safeParse(req.params.id).success?next():res.status(400).json({error:'Invalid adventure ID.'});
router.get('/',async(req,res,next)=>{
  try{const favorites=await Favorite.find({user:req.user._id,saved:{$ne:false}}).populate({path:'adventure',select:'-submittedBy -reviewReason -reviewedBy -reviewedAt',match:{status:{$in:['published',null]}}}).sort({createdAt:-1}).lean();res.json({favorites:favorites.filter(f=>f.adventure)});}catch(e){next(e);}
});
router.post('/',async(req,res,next)=>{
  try{
    const parsed=idSchema.safeParse(req.body?.adventureId);
    if(!parsed.success||Object.keys(req.body??{}).some(k=>k!=='adventureId'))return res.status(400).json({error:'Invalid adventure ID.'});
    if(!await Adventure.exists({_id:parsed.data,status:{$in:['published',null]}}))return res.status(404).json({error:'Adventure not found.'});
    const favorite=await Favorite.findOneAndUpdate({user:req.user._id,adventure:parsed.data},{$set:{saved:true},$setOnInsert:{visited:false}},{new:true,upsert:true,setDefaultsOnInsert:true});
    res.status(200).json({favorite,message:'Saved to favorites.'});
  }catch(e){next(e);}
});
router.patch('/:id',validId,validate(favoriteUpdateSchema),async(req,res,next)=>{
  try{const favorite=await Favorite.findOneAndUpdate({user:req.user._id,adventure:req.params.id},{$set:{visited:req.body.visited,...(!req.body.visited?{visitedOn:null}:{})}},{new:true});if(!favorite)return res.status(404).json({error:'Favorite not found.'});res.json({favorite});}catch(e){next(e);}
});
router.delete('/:id',validId,async(req,res,next)=>{
  try{const result=await Favorite.updateOne({user:req.user._id,adventure:req.params.id,saved:{$ne:false}},{$set:{saved:false}});if(!result.matchedCount)return res.status(404).json({error:'Favorite not found.'});res.json({message:'Removed from favorites.'});}catch(e){next(e);}
});
export default router;
