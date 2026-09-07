import mongoose, { Schema, Document, Model } from 'mongoose';

export type PostStatus = 'draft' | 'published';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  topic: string;
  postType: string;
  tone: string;
  language: string;
  cta: string;
  content: string;
  status: PostStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location ID is required'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    postType: {
      type: String,
      required: [true, 'Post type is required'],
      enum: ['Update', 'Offer', 'Event', 'Product', 'Announcement'],
      default: 'Update',
    },
    tone: {
      type: String,
      required: [true, 'Tone is required'],
      enum: ['Professional', 'Friendly', 'Casual', 'Promotional', 'Informative'],
      default: 'Professional',
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English',
    },
    cta: {
      type: String,
      required: [true, 'CTA is required'],
      enum: ['Book', 'Order', 'Shop', 'Learn More', 'Call Now', 'Sign Up', 'Get Offer'],
      default: 'Learn More',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
