import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type LessonType = 'video' | 'pdf' | 'article';
export type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface ILesson {
  _id?: Types.ObjectId;
  title: string;
  type: LessonType;
  contentUrl?: string;
  content?: string;
  duration?: number; // in minutes
  order: number;
  quizId?: Types.ObjectId;
}

export interface IModule {
  _id?: Types.ObjectId;
  title: string;
  order: number;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  modules: IModule[];
  competencyTags: string[];
  createdBy: string; // Clerk user ID
  orgId: string;
  status: CourseStatus;
  mandatory: boolean;
  estimatedDuration?: number; // total minutes
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['video', 'pdf', 'article'],
      required: true,
    },
    contentUrl: { type: String, trim: true },
    content: { type: String },
    duration: { type: Number, min: 0 },
    order: { type: Number, required: true, min: 0 },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  },
  { _id: true }
);

const ModuleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 0 },
    lessons: { type: [LessonSchema], default: [] },
  },
  { _id: true }
);

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    thumbnail: { type: String, trim: true },
    modules: { type: [ModuleSchema], default: [] },
    competencyTags: { type: [String], default: [] },
    createdBy: { type: String, required: true, trim: true },
    orgId: { type: String, required: true, trim: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
      index: true,
    },
    mandatory: { type: Boolean, default: false },
    estimatedDuration: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
