const User = require("../models/user");

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
  try {
    const user = await User.findById("66e27023266d85648842863f");
    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      if (err) console.log(err);
      res.redirect("/");
    });
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
