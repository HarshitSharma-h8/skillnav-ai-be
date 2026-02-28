import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },

    // profile fields for later
    location: { type: String, default: "" }, 
    targetRole: { type: String, default: "" }, 
    skills: { type: [String], default: [] },
    education: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
