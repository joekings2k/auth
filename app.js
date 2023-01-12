//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const passport = require("passport");
const userMode = require("./user");
const User = userMode.userModel;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("Public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

let conn = async () => {
  mongoose.set("strictQuery", false);
  mongoose.connect(
    "mongodb://0.0.0.0:27017/userDB",
    () => {
      console.log("connected");
    },
    (err) => {
      console.log(err);
    }
  );
};
conn();
passport.use(User.createStrategy());
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.displayName });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile)
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.route("/").get((req, res) => {
  res.render("home");
});
app
  .route("/auth/google")
  .get(passport.authenticate("google", { scope: ["profile"] }));



app
  .route("/auth/google/secrets")
  .get(
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/secrets");
    }
  );

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    let userrLog = async () => {
      const user = await new User({
        username: email,
        password: password,
      });

      req.login(user, (err) => {
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets");
          });
        }
      });
    };
    userrLog();
  });

app.route("/secrets").get((req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    User.register({ username: req.body.username }, password, (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
  });

app.route("/logout").get((req, res) => {
  req.logout((err) => {
    if (!err) {
      res.redirect("/");
    } else {
      console.log(err.message);
    }
  });
});

app.listen(port, () => {
  console.log(`server has started on port ${port}`);
});
