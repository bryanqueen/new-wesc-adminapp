import mongoose from 'mongoose'

const ApplicationSchema = new mongoose.Schema({
  applicantName: {
    type: String,
    required: true,
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true,
  },
  formData: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema)

