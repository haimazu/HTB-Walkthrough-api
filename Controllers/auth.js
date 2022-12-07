const asyncErrorWrapper = require("express-async-handler");
const User = require("../Models/user");
const Story = require("../Models/story");
const CustomError = require("../Helpers/error/CustomError");
const { sendToken } = require("../Helpers/auth/tokenHelpers");
const sendEmail = require("../Helpers/Libraries/sendEmail");
const {
  validateUserInput,
  comparePassword,
} = require("../Helpers/input/inputHelpers");

const getPrivateData = asyncErrorWrapper((req, res, next) => {
  return res.status(200).json({
    success: true,
    message: "You got access to the private data in this route ",
    user: req.user,
  });
});

const register = asyncErrorWrapper(async (req, res, next) => {
  const { username, email, password } = req.body;

  const checkUsername = await User.findOne({ username }).select("-password");

  if (checkUsername) {
    return res.status(400).json({ msg: "This username is already exists" });
  }

  const checkEmail = await User.findOne({ email }).select("-password");

  if (checkEmail) {
    return res.status(400).json({ msg: "This email is already exists" });
  }

  const newUser = await User.create({
    username,
    email,
    password,
  });

  sendToken(newUser, 201, res);
});

const login = asyncErrorWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!validateUserInput(email, password)) {
    return res.status(400).json({ msg: "Please check your inputs" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).json({ msg: "Please check your credentails" });
  }

  if (!comparePassword(password, user.password)) {
    return res.status(400).json({ msg: "Please check your credentails" });
  }

  sendToken(user, 200, res);
});

const machinecontent = asyncErrorWrapper(async (req, res, next) => {
  const slug = req.body.slug;
  const password = req.body.password;

  const story = await Story.findOne({ slug: slug });

  if (!comparePassword(password, story.password)) {
    return next(new CustomError("Please check your password", 404));
  }

  return res.status(200).json({
    success: true,
    data: story,
  });
});

const forgotpassword = asyncErrorWrapper(async (req, res, next) => {
  const { URI, EMAIL_USERNAME } = process.env;

  const resetEmail = req.body.email;

  const user = await User.findOne({ email: resetEmail });

  if (!user) {
    return next(new CustomError("Invalid credentials", 400));
  }

  const resetPasswordToken = user.getResetPasswordTokenFromUser();

  await user.save();

  const resetPasswordUrl = `${URI}/resetpassword?resetPasswordToken=${resetPasswordToken}`;

  const emailTemplate = `
    <h3 style="color : red "> Reset Your Password </h3>
    <p> This <a href=${resetPasswordUrl}   
     target='_blank'  >Link </a> will expire in 1 hours </p> 
    `;

  try {
    sendEmail({
      from: EMAIL_USERNAME,
      to: resetEmail,
      subject: "✔ Reset Your Password ✔",
      html: emailTemplate,
    });

    return res.status(200).json({
      success: true,
      message: "Email Send",
    });
  } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

    await user.save();

    return next(new CustomError("Email could not be send", 500));
  }
});

const resetpassword = asyncErrorWrapper(async (req, res, next) => {
  const newPassword = req.body.newPassword || req.body.password;

  const { resetPasswordToken } = req.query;

  if (!resetPasswordToken) {
    return next(new CustomError("Please provide a valid token", 400));
  }

  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Invalid token or Session Expired", 400));
  }

  user.password = newPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Reset password successfull",
  });
});

module.exports = {
  register,
  login,
  machinecontent,
  resetpassword,
  forgotpassword,
  getPrivateData,
};
