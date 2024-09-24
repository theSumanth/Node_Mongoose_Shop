const Product = require("../models/product");
const Order = require("../models/order");
const { generateInvoice } = require("../util/pdfGenerator");

const PRODUCTS_PER_PAGE = 10;

exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const productsCount = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE);

    const lastPage = Math.ceil(productsCount / PRODUCTS_PER_PAGE);
    const hasNextPage = page * PRODUCTS_PER_PAGE < productsCount;
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/products",
      firstPage: 1,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: lastPage,
      hasNextPage: hasNextPage,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById({ _id: prodId });
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const productsCount = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((page - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE);

    const lastPage = Math.ceil(productsCount / PRODUCTS_PER_PAGE);
    const hasNextPage = page * PRODUCTS_PER_PAGE < productsCount;
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      firstPage: 1,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: lastPage,
      hasNextPage: hasNextPage,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const { cart } = await req.user.populate("cart.items.productId");
    const products = cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    // const product = await Product.findById(prodId);
    await req.user.addToCart(prodId);
    console.log("ADDDED TO THE CART");
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    await req.user.updateOne({
      $pull: { "cart.items": { productId: prodId } },
    });
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  const { username, email, _id } = req.user;
  const products = req.user.cart.items.map((item) => {
    return {
      productId: item.productId,
      quantity: item.quantity,
    };
  });
  try {
    const order = new Order({
      user: { email: email, userId: _id },
      products: products,
    });

    await order.save();
    await req.user.updateOne({
      $set: { "cart.items": [] },
    });
    res.redirect("/orders");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate({
      path: "products.productId",
      select: "title",
    });

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getOrderInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId).populate({
      path: "products.productId",
      select: "title price",
    });
    if (!order) {
      return next(new Error("No order found!"));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }

    generateInvoice(orderId, order, req, res);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
