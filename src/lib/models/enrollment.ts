import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'overdue';

export interface IEnrollment extends Document {
  userId: string; // Clerk user ID
  courseId: Types.ObjectId;
  orgId: string;
  assignedBy?: string | null; // Clerk user ID, null for self-enrolled
  dueDate?: Date;
  mandatory: boolean;
  status: EnrollmentStatus;
  progress: number; // 0 to 100
  completedLessons: Types.ObjectId[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: String, required: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    orgId: { type: String, required: true, trim: true },
    assignedBy: { type: String, default: null, trim: true },
    dueDate: { type: Date },
    mandatory: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'overdue'],
      default: 'enrolled',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: Schema.Types.ObjectId }],
    completedAt: { type: Date },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ orgId: 1, status: 1 });

export const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export default Enrollment;
