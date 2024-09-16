const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    path: "/signup",
    isAuthenticated: false,
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return res.redirect("/login");
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        email: email,
        password: hashedPassword,
      });
      await newUser.save();
      return res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: false,
  });
};

exports.postLogin = async (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; httpOnly');
  // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age:10; Secure');
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (user && isPasswordCorrect) {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save((err) => {
        if (err) console.log(err);
        return res.redirect("/");
      });
    } else {
      return res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    req.session.destroy((e) => {
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
  }
};
