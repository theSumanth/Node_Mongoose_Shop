const { body } = require("express-validator");

exports.addAndEditProduct = [
  body("title", "Invalid Title").isString().isLength({ min: 3 }).trim(),
  body("imageUrl", "Invalid image URL").isURL(),
  body("price").isFloat(),
  body("description", "Invalid description length")
    .isLength({ min: 8, max: 100 })
    .trim(),
];
