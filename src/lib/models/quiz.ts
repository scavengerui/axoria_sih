import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IQuestion {
  _id?: Types.ObjectId;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  lessonId: Types.ObjectId;
  courseId: Types.ObjectId;
  questions: IQuestion[];
  passThreshold: number; // default 70
  timeLimit?: number; // minutes
  maxRetakes: number; // default 3
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => Array.isArray(val) && val.length >= 2,
        'A question must have at least 2 options.',
      ],
    },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, trim: true },
  },
  { _id: true }
);

const QuizSchema = new Schema<IQuiz>(
  {
    lessonId: { type: Schema.Types.ObjectId, required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    questions: { type: [QuestionSchema], default: [] },
    passThreshold: { type: Number, default: 70, min: 0, max: 100 },
    timeLimit: { type: Number, min: 1 },
    maxRetakes: { type: Number, default: 3, min: 0 },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

export default Quiz;
