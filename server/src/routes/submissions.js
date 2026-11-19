import { Router } from 'express';
import { z } from 'zod';
import { Adventure } from '../models/Adventure.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adventureSchema, idSchema } from '../utils/validation.js';
const router=Router();
const submissionSchema=adventureSchema.pick({title:true,description:true,region:true,location:true,estimatedCost:true,durationMinutes:true,moods:true,sourceUrl:true,latitude:true,longitude:true}).strict().refine(d=>(d.latitude===null)===(d.longitude===null),'Provide both coordinates or neither');
router.use(requireAuth);
router.get('/',async(req,res,next)=>{try{res.json({submissions:await Adventure.find({submittedBy:req.user._id}).sort({createdAt:-1}).lean()});}catch(e){next(e);}});
router.post('/',validate(submissionSchema),async(req,res,next)=>{try{
 const submission=await Adventure.create({...req.body,status:'pending',costStatus:'estimate',createdBy:req.user._id,submittedBy:req.user._id});
 res.status(201).json({submission});
}catch(e){next(e);}});
router.get('/review',requireAdmin,async(req,res,next)=>{try{res.json({submissions:await Adventure.find({status:'pending',submittedBy:{$ne:null}}).sort({createdAt:1}).lean()});}catch(e){next(e);}});
router.patch('/:id/review',requireAdmin,validate(z.object({decision:z.enum(['approve','reject']),reason:z.string().trim().max(500).default('')}).strict().refine(d=>d.decision!=='reject'||d.reason.length>0,'Explain why you rejected the suggestion')),async(req,res,next)=>{try{
 if(!idSchema.safeParse(req.params.id).success)return res.status(400).json({error:'Invalid submission ID.'});
 // Atomic pending-only transition prevents double decisions and duplicate publication.
 const submission=await Adventure.findOneAndUpdate({_id:req.params.id,status:'pending',submittedBy:{$ne:null}},{$set:{status:req.body.decision==='approve'?'published':'rejected',reviewReason:req.body.reason,reviewedBy:req.user._id,reviewedAt:new Date()}},{new:true,runValidators:true});
 if(!submission)return res.status(409).json({error:'This suggestion has already been reviewed or is no longer available. Refresh the review list.'});
 res.json({submission});
}catch(e){next(e);}});
export default router;
