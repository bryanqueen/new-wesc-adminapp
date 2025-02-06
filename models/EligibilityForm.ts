import mongoose, { Schema, type Document } from "mongoose";

export interface IEligibilityForm extends Document {
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      type: string;
      label: string;
      placeholder?: string;
      helpText?: string;
      options?: string[];
      required: boolean;
      validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        customError?: string;
      };
    }>;
  }>;
  settings: {
    submitButtonText: string;
    successMessage: string;
    enableEmailNotifications: boolean;
    notificationEmail?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EligibilityFormSchema: Schema = new Schema(
  {
    sections: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        fields: [
          {
            id: { type: String, required: true },
            type: { type: String, required: true },
            label: { type: String, required: true },
            placeholder: { type: String },
            helpText: { type: String },
            options: [{ type: String }],
            required: { type: Boolean, required: true },
            validation: {
              minLength: { type: Number },
              maxLength: { type: Number },
              pattern: { type: String },
              customError: { type: String },
            },
          },
        ],
      },
    ],
    settings: {
      submitButtonText: { type: String, required: true },
      successMessage: { type: String, required: true },
      enableEmailNotifications: { type: Boolean, required: true },
      notificationEmail: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.EligibilityForm ||
  mongoose.model<IEligibilityForm>("EligibilityForm", EligibilityFormSchema);