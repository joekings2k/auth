require("dotenv").config();
const passportLocalMOngoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret:String
});
const secret =process.env.SECRET

userSchema.plugin(passportLocalMOngoose)
userSchema.plugin(findOrCreate)
module.exports = {
  userModel: mongoose.model("User", userSchema),
};
