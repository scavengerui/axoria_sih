import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICertificate extends Document {
  userId: string; // Clerk user ID
  courseId: Types.ObjectId;
  orgId: string;
  pdfUrl?: string; // Cloudinary URL
  certificateId: string; // Unique human-readable ID e.g. AX-A1B2C3D4
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: { type: String, required: true, trim: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    orgId: { type: String, required: true, trim: true, index: true },
    pdfUrl: { type: String, trim: true },
    certificateId: { type: String, required: true, unique: true, trim: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);

export default Certificate;
