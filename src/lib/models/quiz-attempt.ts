import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IQuizAttempt extends Document {
  userId: string; // Clerk user ID
  quizId: Types.ObjectId;
  courseId: Types.ObjectId;
  answers: number[]; // Selected option indices
  score: number; // Percentage score (0-100)
  passed: boolean;
  attemptNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: String, required: true, trim: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    answers: { type: [Number], default: [] },
    score: { type: Number, required: true, min: 0, max: 100 },
    passed: { type: Boolean, required: true },
    attemptNumber: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

QuizAttemptSchema.index({ userId: 1, quizId: 1, attemptNumber: 1 });

export const QuizAttempt: Model<IQuizAttempt> =
  mongoose.models.QuizAttempt ||
  mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

export default QuizAttempt;
