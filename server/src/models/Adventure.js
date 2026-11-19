import mongoose from 'mongoose';
export const moodOptions = ['nature', 'relax', 'culture', 'food', 'adventure', 'romantic'];
export const coverOptions = ['mountains', 'sea', 'forest', 'city', 'sunset', 'heritage'];
const adventureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1100 },
  region: { type: String, required: true, trim: true, maxlength: 75 },
  location: { type: String, required: true, trim: true, maxlength: 90 },
  estimatedCost: { type: Number, required: true, min: 0, max: 1000 },
  durationMinutes: { type: Number, required: true, min: 30, max: 1440 },
  moods: { type: [{ type: String, enum: moodOptions }], validate: { validator: v => v.length > 0 && v.length <= 4, message: 'Choose 1–4 moods' } },
  cover: { type: String, enum: coverOptions, default: 'mountains' },
  imageUrl: { type: String, default: '' },
  tips: { type: String, trim: true, maxlength: 350, default: '' },
  category: {type:String, default:'other'},
  district: {type:String, default:''},
  environment: {type:String, enum:['indoor','outdoor','mixed','unknown'], default:'unknown'},
  difficulty: {type:String, enum:['easy','moderate','hard','unknown'], default:'unknown'},
  latitude: {type:Number, min:-90, max:90, default:null},
  longitude: {type:Number, min:-180, max:180, default:null},
  costStatus: {type:String, enum:['estimate','verified','unknown'], default:'estimate'},
  activities: {type:String, default:''},
  bestSeason: {type:String, default:''},
  openingHours: {type:String, default:''},
  bookingUrl: {type:String, default:''},
  sourceUrl: {type:String, default:''},
  checkedOn: {type:String, default:''},
  imageCredit: {type:String, default:''},
  imageSource: {type:String, default:''},
  imageLicense: {type:String, default:''},
  status: {type:String, enum:['draft','published','pending','rejected'], default:'published'},
  submittedBy: {type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},
  reviewReason: {type:String,default:'',maxlength:500},
  reviewedBy: {type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},
  reviewedAt: {type:Date,default:null},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, versionKey: false });
adventureSchema.index({status:1,region:1,category:1});
export const Adventure = mongoose.model('Adventure', adventureSchema);
