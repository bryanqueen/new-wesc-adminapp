import mongoose from 'mongoose'

const OTPSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema)

