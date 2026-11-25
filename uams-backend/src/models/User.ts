import mongoose, { type Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  firstName: string;
  middleName?: string | undefined;
  lastName: string;
  email?: string;
  password: string;
  role: "admin" | "lecturer" | "student";
  mustChangePassword: boolean;
  isActive: boolean;

  comparePassword(
    enteredPassword: string
  ): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    middleName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "lecturer", "student"],
      required: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (
  enteredPassword: string
) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toJSON", {
  transform: function (_doc, ret) {
    const { password, ...safeUser } = ret;
    return safeUser;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);