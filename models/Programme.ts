import mongoose from 'mongoose'

const ProgrammeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  coverImage: String,
  content: mongoose.Schema.Types.Mixed,
  form: mongoose.Schema.Types.Mixed,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

export default mongoose.models.Programme || mongoose.model('Programme', ProgrammeSchema)

