import mongoose from 'mongoose';
const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adventure: { type: mongoose.Schema.Types.ObjectId, ref: 'Adventure', required: true },
  saved: {type:Boolean,default:true},
  visitedOn: {type:String,default:null},
  visited: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
favoriteSchema.index({ user: 1, adventure: 1 }, { unique: true });
export const Favorite = mongoose.model('Favorite', favoriteSchema);
