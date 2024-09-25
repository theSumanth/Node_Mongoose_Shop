const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middlewares/is-auth");
const productValidator = require("../validators/product");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/products", isAuth, adminController.getProducts);

router.post(
  "/add-product",
  isAuth,
  productValidator.addAndEditProduct,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  isAuth,
  productValidator.addAndEditProduct,
  adminController.postEditProduct
);

router.delete(
  "/delete-product/:productId",
  isAuth,
  adminController.deleteProduct
);

module.exports = router;
