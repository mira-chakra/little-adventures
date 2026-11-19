import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 70 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true, versionKey: false });
export const User = mongoose.model('User', userSchema);
export const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email, role: user.role });
