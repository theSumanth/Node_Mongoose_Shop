const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const { KEYS } = require("../keys");

sgMail.setApiKey(KEYS.SENDGRID_API_KEY);

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  message = message[0];

  res.render("auth/signup", {
    pageTitle: "Sign Up",
    path: "/signup",
    errorMessage: message,
    oldInputs: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  console.log(errors.array());

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Sign Up",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInputs: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });
    await newUser.save();

    const msg = {
      to: email,
      from: KEYS.FROM_EMAIL,
      subject: "Signup Successfull",
      text: "Successfully Signed up",
      html: `
          <h1>Sign Up successfull!</h1>
          <p>Thanks for choosing us</p>
        `,
    };

    await sgMail.send(msg);
    return res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  message = message[0];

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
    oldInputs: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; httpOnly');
  // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age:10; Secure');
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      oldInputs: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }

  try {
    const user = await User.findOne({ email: email });
    let isPasswordCorrect;
    if (user) {
      isPasswordCorrect = await bcrypt.compare(password, user.password);
    }
    if (user && isPasswordCorrect) {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save((err) => {
        if (err) console.log(err);
        return res.redirect("/");
      });
    } else {
      let error = {};
      if (!user) {
        error.message = "No User found for the Email";
        error.path = "email";
      } else if (!isPasswordCorrect) {
        error.message = "Password is incorrect";
        error.path = "password";
      }

      return res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        errorMessage: error.message,
        oldInputs: { email: email, password: password },
        validationErrors: [error],
      });
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    req.session.destroy((e) => {
      res.redirect("/");
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  message = message[0];

  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: message,
    oldInputs: { email: "" },
    validationErrors: [],
  });
};

exports.postReset = async (req, res, next) => {
  const email = req.body.email;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/reset", {
      pageTitle: "Reset Password",
      path: "/reset",
      errorMessage: errors.array()[0].msg,
      oldInputs: { email: email },
      validationErrors: errors.array(),
    });
  }

  try {
    const user = await User.findOne({ email: email });

    crypto.randomBytes(32, async (err, Buffer) => {
      if (err) {
        console.log(err);
        return res.status(422).render("auth/reset", {
          pageTitle: "Reset Password",
          path: "/reset",
          errorMessage: err.message,
          oldInputs: { email: email },
          validationErrors: [],
        });
      }
      const token = Buffer.toString("hex");
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3200000;
      await user.save();

      const msg = {
        to: email,
        from: KEYS.FROM_EMAIL,
        subject: "Password Reset",
        text: "Please use below link to reset your password",
        html: `
          <h1>Reset Your Password</h1>
          <h5>Please <a href='${KEYS.API_BASE_URL}/reset/${token}'>click here</a> to change the password.</h5>
        `,
      };

      await sgMail.send(msg);
      return res.redirect("/login");
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (user) {
    let message = req.flash("error");
    message = message[0];

    res.render("auth/new-password", {
      pageTitle: "New Password",
      path: "/new-password",
      errorMessage: message,
      token: token,
      userId: user._id,
      oldInputs: { newPassword: "" },
      validationErrors: [],
    });
  } else {
    req.flash("error", "Something wrong happened!");
    return res.redirect("/login");
  }
};

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.newPassword;
  const token = req.body.token;
  const userId = req.body.userId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/new-password", {
      pageTitle: "New Password",
      path: "/new-password",
      token: token,
      userId: userId,
      errorMessage: errors.array()[0].msg,
      oldInputs: { newPassword: newPassword },
      validationErrors: errors.array(),
    });
  }

  try {
    const resetUser = await User.findOne({
      resetToken: token,
      _id: userId,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!resetUser) {
      req.flash("error", "Token Expired or Invalid User");
      return res.redirect("/login");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    resetUser.password = hashedNewPassword;
    resetUser.token = undefined;
    resetUser.resetTokenExpiration = undefined;

    await resetUser.save();
    return res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
