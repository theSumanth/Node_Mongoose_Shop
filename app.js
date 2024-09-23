const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const crypto = require("crypto");

const errorController = require("./controllers/error");
const User = require("./models/user");

const { KEYS } = require("./keys");

const app = express();

const store = new MongoDbStore({
  uri: KEYS.MONGO_CONNECTION_URI,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    crypto.randomBytes(20, (err, buffer) => {
      const name =
        Date.now() +
        buffer.toString("hex") +
        "." +
        file.originalname.split(".").reverse()[0];
      callback(null, name);
    });
  },
});

const fileFilter = (req, file, callback) => {
  const fileTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (fileTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: KEYS.SESSION_SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use(async (req, res, next) => {
  try {
    if (req.session.user) {
      const user = await User.findById(req.session.user);
      req.user = user;
    }
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log("error handlerz");
  const statusCode = error.httpStatusCode || 500;
  const message = error.message || "Something Error has occured";
  console.log(message);
  console.log(error);
  return res.status(statusCode).render("500", {
    pageTitle: "Server side error",
    path: "/500",
    errorMessage: message,
  });
});

mongoose
  .connect(KEYS.MONGO_CONNECTION_URI)
  .then(() => {
    console.log("connected to the database");
    app.listen(KEYS.PORT, () => {
      console.log(`listening to port ${KEYS.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
