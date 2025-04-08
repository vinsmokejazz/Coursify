import mongoose, { Schema, model, Document } from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

interface IAdmin extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

interface ICourse extends Document {
  title: string;
  description: string;
  adminId: mongoose.Types.ObjectId;
  image: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    adminId: { type: ObjectId, ref: "Admin", required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const purchaseSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    courseId: { type: ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

// Add indexes for better query performance
UserSchema.index({ email: 1 });
adminSchema.index({ email: 1 });
courseSchema.index({ adminId: 1 });
purchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const User = model<IUser>("User", UserSchema);
export const Admin = model<IAdmin>("Admin", adminSchema);
export const Course = model<ICourse>("Course", courseSchema);
export const Purchase = model<IPurchase>("Purchase", purchaseSchema);
