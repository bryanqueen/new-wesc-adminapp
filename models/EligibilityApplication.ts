import mongoose, { Schema, type Document } from "mongoose"

export interface IEligibilityApplication extends Document {
  applicantName: string
  formData: Record<string, any>
  seen: boolean
  createdAt: Date
  updatedAt: Date
}

const EligibilityApplicationSchema: Schema = new Schema(
  {
    applicantName: { type: String, required: true },
    formData: { type: Schema.Types.Mixed, required: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.models.EligibilityApplication ||
  mongoose.model<IEligibilityApplication>("EligibilityApplication", EligibilityApplicationSchema)

