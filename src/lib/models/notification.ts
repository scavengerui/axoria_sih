import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'assignment'
  | 'deadline'
  | 'course_update'
  | 'certificate'
  | 'approval'
  | 'general';

export interface INotification extends Document {
  userId: string; // Clerk user ID
  orgId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, trim: true },
    orgId: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['assignment', 'deadline', 'course_update', 'certificate', 'approval', 'general'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
