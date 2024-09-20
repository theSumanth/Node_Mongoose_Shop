const { body } = require("express-validator");

const User = require("../models/user");

exports.signup = [
  body("email")
    .isEmail()
    .withMessage("Invalid Email")
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          const error = { message: "Email already exists" };
          throw error;
        }
      } catch (err) {
        return Promise.reject(err.message || "Some Error has occured.");
      }
    }),

  body("password", "Password must have length 8 and only be letters and digits")
    .isLength({ min: 8 })
    .isAlphanumeric(),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords does not match!");
    }
  }),
];

exports.login = [body("email").isEmail().withMessage("Invalid Email")];

exports.resetPassword = [
  body("email")
    .isEmail()
    .withMessage("Invalid Email")
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (!user) {
          const error = { message: "No user found this email" };
          throw error;
        }
      } catch (err) {
        return Promise.reject(err.message || "Some Error has occured");
      }
    }),
];

exports.newPassword = [
  body("password", "Password must have length 8 and only be letters and digits")
    .isLength({ min: 8 })
    .isAlphanumeric(),
];
