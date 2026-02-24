import mongoose, { Document, Schema } from "mongoose";

export interface EmailVerificationDocument extends Document {
  email: string;
  verificationCode: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emailVerificationSchema = new Schema<EmailVerificationDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    verificationCode: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    // Automatically delete documents after they expire
    expires: 600 // 10 minutes in seconds
  }
);

// Index for efficient queries
emailVerificationSchema.index({ email: 1, verificationCode: 1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerificationModel =
  (mongoose.models.EmailVerification as mongoose.Model<EmailVerificationDocument>) ||
  mongoose.model<EmailVerificationDocument>("EmailVerification", emailVerificationSchema);

export default EmailVerificationModel;