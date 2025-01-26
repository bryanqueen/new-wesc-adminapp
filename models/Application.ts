import mongoose from 'mongoose'

const ApplicationSchema = new mongoose.Schema({
  programmeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Programme',
    required: true,
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
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

