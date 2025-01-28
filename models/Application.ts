
import Programme from './Programme'
import mongoose from 'mongoose'

const ApplicationSchema = new mongoose.Schema({
  programmeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Programme,  // This is the crucial addition - referencing the Programme model
    required: true,
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  seen: { 
    type: Boolean,
    default: false
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