import { Router } from 'express';
import { Adventure } from '../models/Adventure.js';
import { Favorite } from '../models/Favorite.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idSchema, visitSchema } from '../utils/validation.js';
const router=Router();router.use(requireAuth);
router.get('/',async(req,res,next)=>{try{
 const visits=await Favorite.find({user:req.user._id,visited:true}).populate({path:'adventure',select:'-submittedBy -reviewReason -reviewedBy -reviewedAt',match:{status:{$in:['published',null]}}}).sort({visitedOn:-1,updatedAt:-1}).lean();
 res.json({visits:visits.filter(v=>v.adventure)});
}catch(e){next(e);}});
router.put('/:id',validate(visitSchema),async(req,res,next)=>{try{
 if(!idSchema.safeParse(req.params.id).success)return res.status(400).json({error:'Invalid adventure ID.'});
 if(!await Adventure.exists({_id:req.params.id,status:{$in:['published',null]}}))return res.status(404).json({error:'Adventure not found.'});
 const visit=await Favorite.findOneAndUpdate({user:req.user._id,adventure:req.params.id},{$set:{visited:true,visitedOn:req.body.visitedOn},$setOnInsert:{saved:false}},{new:true,upsert:true,runValidators:true});
 res.json({visit});
}catch(e){next(e);}});
router.delete('/:id',async(req,res,next)=>{try{
 if(!idSchema.safeParse(req.params.id).success)return res.status(400).json({error:'Invalid adventure ID.'});
 await Favorite.updateOne({user:req.user._id,adventure:req.params.id},{$set:{visited:false,visitedOn:null}});
 res.json({message:'Removed from history. Any saved favorite is kept.'});
}catch(e){next(e);}});
export default router;
