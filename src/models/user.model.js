import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    DOB: {
      type: Date,
    },
    school: {
      type: String,
    },
    std: {
      type: String,
    },
    mediumOfStudy: {
      type: String,
      enum: ["Hindi", "Gujarati", "English", "Marathi"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, firstName: this.firstName },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {  
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

userSchema.methods.generateResetToken = function () {
  return jwt.sign({ _id: this._id }, process.env.RESET_TOKEN_SECRET, {
    expiresIn: process.env.RESET_TOKEN_EXPIRY,
  });
};
userSchema.methods.isPasswordCorrect = async function (password) {
  try {
    if (!this.password) throw new Error("Password is missing");
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    return false;
  }
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

export const User = mongoose.model("User", userSchema);
