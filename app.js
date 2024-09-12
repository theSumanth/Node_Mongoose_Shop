const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
const User = require("./models/user");

const { KEYS } = require("./keys");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
  try {
    const user = await User.findById("66e27023266d85648842863f");
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(KEYS.MONGO_CONNECTION_URI)
  .then(() => {
    console.log("connected to the database");
    return User.findById("66e27023266d85648842863f");
  })
  .then((user) => {
    if (!user) {
      const newUser = new User({
        username: "sumanth",
        email: "test@gmail.com",
        cart: { items: [], quantity: 0 },
      });
      return newUser.save();
    }
    return user;
  })
  .then(() => {
    app.listen(KEYS.PORT, () => {
      console.log(`listening to port ${KEYS.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
