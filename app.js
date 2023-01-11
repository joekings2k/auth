//jshint esversion:6
require("dotenv").config()
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const userMode = require("./user");
const User = userMode.userModel;
const port = 3000;


app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("Public"));
app.set("view engine", "ejs");

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

app.route("/").get((req, res) => {
  res.render("home");
});

app.route("/login")
	.get((req, res) => {
  res.render("login");
})
	.post((req,res)=>{
		const email = req.body.username;
    const password = req.body.password;
		User.findOne({email:email},(err,foundUser)=>{
			if(err){
				console.log(err.message)
        res.redirect("/")
			}else{
				if(foundUser){
					if(foundUser.password ===password){
						res.render("secrets")
					}
				}
			}
		})

	})



app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    const create = async () => {
      try {
        const newUser = new User({
          email: email,
          password: password,
        });
        newUser.save((err) => {
          if (err) {
            console.log(err);
          } else {
            res.render("secrets");
          }
        });
      } catch (err) {
        console.log(err.message);
      }
    };
    create();
  });

app.listen(port, () => {
  console.log(`server has started on port ${port}`);
});