const express = require("express");

const { check } = require("express-validator");

const userValidator = require("../validators/user");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/signup", authController.getSignup);

router.post("/signup", userValidator.signup, authController.postSignup);

router.get("/login", authController.getLogin);

router.post("/login", userValidator.login, authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", userValidator.resetPassword, authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post(
  "/new-password",
  userValidator.newPassword,
  authController.postNewPassword
);

module.exports = router;
