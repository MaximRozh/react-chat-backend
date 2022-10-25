import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    picture: {
      type: String,
    },
    // newMessages: {
    //   type: Object,
    //   default: {},
    // },
    status: {
      type: String,
      default: "online",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
