import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { sendEmail } from "../utils/mailer.js";
import { User } from "../models/user.model.js";
import resetPasswordEmailTemplate from "../EmailTemplates/resetPassword.js";
import welcomeEmailTemplate from "../EmailTemplates/welcomeEmail.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateRefreshAccessToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "user not exist");

  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while refreshing tokens !!",
      error
    );
  }
};

const register = asyncHandler(async (req, res) => {
  let { username, email, firstName, lastName, mobile, password } = req.body;
  if (
    [username, email, firstName, lastName, mobile, password].some(
      (field) => (field?.trim() ?? "") === ""
    )
  )
    throw new ApiError(404, "All fields are required");

  // trim the fields
  username = username.trim();
  email = email.trim();

  const existedUser = await User.findOne({
    username: { $regex: new RegExp(username, "i") },
  });

  if (existedUser)
    throw new ApiError(
      404,
      `User already exist with same username ${username}\n Please try with different username`
    );

  const user = await User.create({
    username: username.trim(),
    email: email.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    mobile,
    password: password.trim(),
  });

  if (!user)
    throw new ApiError(404, `Something went wrong while creating account`);
  // here we are sending welcome email to the user and not halting the response
  // if the email is not sent successfully then it will not affect the user registration
  sendEmail({
    to: user.email,
    subject: "Welcome to APC Bal Mandal",
    html: welcomeEmailTemplate(user.username),
    text: `Welcome to APC Bal Mandal\nThank you for joining us !!`,
  }).catch((error) => {
    logger.error("Error while sending email", error);
  });

  res
    .status(200)
    .json(new ApiResponce(200, user, `user created successfully !!`));
});

const login = asyncHandler(async (req, res) => {
  let { username, password } = req.body;
  if ([username, password].some((field) => (field?.trim() ?? "") === ""))
    throw new ApiError(404, `username and password are required`);

  //trim the username and password
  username = username.trim();
  password = password.trim();

  //check if the user exist with the username and password
  const user = await User.findOne({
    username: { $regex: new RegExp(`^${username}$`, "i") },
  });

  if (!user) throw new ApiError(404, `invalid user request`);
  try {
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(404, `Invalid user password !!`);
  } catch (error) {
    throw new ApiError(404, `Error while validating password`, error);
  }
  const { accessToken, refreshToken } = await generateRefreshAccessToken(
    user._id
  );
  //remove password from the obj
  delete user.password;

  //check if the user is active or not
  if (!user?.isActive) {
    throw new ApiError(
      404,
      `Your account is not active. Please contact the admin to activate your account`
    );
  }

  const isProd = process.env.NODE_ENV === "production";

  const baseCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };

  const accessTokenOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000, // 15 min
  };

  const refreshTokenOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new ApiResponce(
        200,
        { user, accessToken, refreshToken },
        `User logged in successfully !!`
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  //here we are not checking if the user is logged in or not,
  // if the user is not logged in then we are just clearing the cookies
  // and sending the response
  // and if logged in then we are clearing the cookies and updating the user refresh token to empty string

  const refreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (refreshToken) {
    try {
      const decodeToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      if(!decodeToken) throw new ApiError(404, `Invalid token`);

      const user = await User.findById(decodeToken._id);
      if (!user) throw new ApiError(404, `Invalid token`);

      if (user.refreshToken !== refreshToken)
        throw new ApiError(404, `Invalid token`);
      // if the token is valid then we are updating the user refresh token to empty string
      user.refreshToken = "";
      await user.save({ validateBeforeSave: false });

    } catch (error) {
      // here no need to throw error if the token is invalid
      // we are just clearing the cookies and sending the response
      logger.error("Error while verifying refresh token", error);
    }
  }

  const isProd = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, `User logged out successfully !!`));
});

const updateuserDetails = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const {
    firstName,
    lastName,
    middleName,
    email,
    mobile,
    DOB,
    school,
    std,
    mediumOfStudy,
    address,
  } = req.body;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, `invalid user request`);

  try {
  
    if (firstName && firstName.trim() !== "" && firstName !== user.firstName) {
      user.firstName = firstName;
    }

    if (lastName && lastName.trim() !== "" && lastName !== user.lastName) {
      user.lastName = lastName;
    }
  
    if (
      middleName &&
      middleName.trim() !== "" &&
      middleName !== user.middleName
    ) {
      user.middleName = middleName;
    }

  
    if (email && email.trim() !== "" && email !== user.email) {
      user.email = email;
    }
  
    if (mobile && mobile.trim() !== "" && mobile !== user.mobile) {
      user.mobile = mobile;
    }
  
    if (DOB && DOB.trim() !== "" && DOB !== user.DOB) {
      user.DOB = DOB;
    }
   
    if (school && school.trim() !== "" && school !== user.school) {
      user.school = school;
    }
   
    if (std && std.trim() !== "" && std !== user.std) {
      user.std = std;
    }
    if (address && address.trim() !== "" && address !== user.address) {
      user.address = address;
    }

    if (
      mediumOfStudy &&
      mediumOfStudy.trim() !== "" &&
      mediumOfStudy !== user.mediumOfStudy
    ) {
      user.mediumOfStudy = mediumOfStudy;
    }
    
    await user.save({ validateBeforeSave: false });
    const updatedUser = await User.findById(id).select(
      "-password -refreshToken"
    );
    if (!updatedUser) throw new ApiError(404, `invalid user request`);
    //remove password from the obj
    delete updatedUser.password;
    delete updatedUser.refreshToken;
    delete updatedUser.resetToken;

    res
      .status(200)
      .json(
        new ApiResponce(
          200,
          updatedUser,
          `User details updated successfully !!`
        )
      );
  } catch (error) {
    throw new ApiError(404, `Error while updating user details`, error);
  }
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;
  if (!avatarLocalPath) throw new ApiError(404, `Avatar is required`);
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar || !avatar.url)
    throw new ApiError(404, `Error while uploading avatar`);

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, `invalid user request`);
  user.avatar = avatar.url;
  await user.save({ validateBeforeSave: false });

  //delete previouse avatar
  const oldAvatar = req.user.avatar;
  if (oldAvatar && oldAvatar.length > 0) {
    try {
      const deleteExistingAvatar = await deleteFromCloudinary(oldAvatar);

      if (deleteExistingAvatar.result !== "ok")
        throw new ApiError(404, `Error while deleting old avatar`);
    } catch (error) {
      throw new ApiError(404, `Error while deleting old avatar`, error);
    }
  }
  res

    .status(200)
    .json(new ApiResponce(200, user, `User avatar updated successfully !!`));
});

const deleteFile = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) throw new ApiError(404, `Url is required to delete file`);
  const deleteFile = await deleteFromCloudinary(url);
  if (deleteFile.result !== "ok")
    throw new ApiError(404, `Error while deleting file`);
  res
    .status(200)
    .json(new ApiResponce(200, {}, `File deleted successfully !!`));
});

const resetPassword = asyncHandler(async (req, res) => {
  //steps
  // 1. get token from the request
  // 2. check if token is valid and not expired
  // 3. get user from the database with the token and user id
  // 4. update the user password with the new password if token is valid
  const { resetToken } = req.params;
  if (!resetToken) throw new ApiError(404, `Token is required`);

  const decodeToken = await jwt.verify(
    resetToken,
    process.env.RESET_TOKEN_SECRET
  );
  if (!decodeToken) throw new ApiError(404, `Invalid token`);

  const user = await User.findOne({
    $and: [
      {
        resetToken: resetToken,
        _id: new mongoose.Types.ObjectId(decodeToken._id),
      },
    ],
  });

  if (!user) throw new ApiError(404, `Invalid token or expired token`);

  const { password } = req.body;
  if (!password) throw new ApiError(404, `Password is required`);

  user.password = password;
  user.resetToken = "";
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponce(200, user, `User password updated successfully !!`));
});


const forgetPassword = asyncHandler(async (req, res) => {
  // steps
  // 1. get email and username from the request
  // 2. check if email and username is valid and exist in the database
  // 3. generate a random token and save it in the database with expiry time- expiry time will be handled by JWT tokens
  // 4. send an email to the user with the token embedded in the link to reset the password
  const { username, email } = req.body;
  if (!username || !email)
    throw new ApiError(404, `Username and email are required`);

  const user = await User.findOne({
    username: { $regex: new RegExp(`^${username}$`, "i") },
    email: { $regex: new RegExp(`^${email}$`, "i") },
  });

  if (!user)
    throw new ApiError(
      404,
      `Invalid user request | Email or username are invalid`
    );
  if (user.username !== username) throw new ApiError(404, `Invalid username`);
  if (user.email !== email) throw new ApiError(404, `Invalid email`);

  const resetToken = user.generateResetToken();
  user.resetToken = resetToken;

  await user.save({ validateBeforeSave: false });

  //send email to the user with the reset token
  const response = await sendEmail({
    to: user.email,
    subject: "Request for password reset link",
    html: resetPasswordEmailTemplate({
      username: user.username,
      reseturl: `${process.env.VITE_BASE_URL}/reset-password/${resetToken}`,
    }),
    text: `Reset password link: ${process.env.WEBSITE_URL}/resetpassword/${resetToken}`,
  });

  if (!response) throw new ApiError(404, `Error while sending email`);

  res
    .status(200)
    .json(
      new ApiResponce(
        200,
        user,
        `Reset password token generated successfully !!`
      )
    );
});

const getCurrentuser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(404, `Invalid user request`);

  res
    .status(200)
    .json(new ApiResponce(200, user, `User details fetched successfully !!`));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken)
    throw new ApiError(404, `Refresh token is required`);
  const decodeToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  try {
    const user = await User.findById(decodeToken._id);

    if (!user) throw new ApiError(404, `Invalid refresh token`);
    if (user.refreshToken !== incomingRefreshToken)
      throw new ApiError(404, `Invalid refresh token or token is expired`);
  } catch (error) {
    throw new ApiError(404, `Error while refreshing access token`, error);
  }
  const { accessToken, refreshToken } = await generateRefreshAccessToken(
    decodeToken._id
  );

  const isProd = process.env.NODE_ENV === "production";

  const baseCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };

  const accessTokenOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000, // 15 min
  };

  const refreshTokenOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new ApiResponce(
        200,
        { accessToken, refreshToken },
        `Access token refreshed successfully !!`
      )
    );
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(404, `User not found`);
  res
    .status(200)
    .json(new ApiResponce(200, user, `User fetched successfully !!`));
});

const updatePassword= asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new ApiError(400, `Old password and new password are required`);

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, `Invalid user request`);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) throw new ApiError(401, `Invalid old password`);

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponce(200, {}, `User password updated successfully !!`));
});

export {
  register,
  login,
  logout,
  updateuserDetails,
  updateAvatar,
  resetPassword,
  forgetPassword,
  getCurrentuser,
  refreshAccessToken,
  getUserById,
  deleteFile,
  updatePassword,
};
