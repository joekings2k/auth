require("dotenv").config();
const mongoose = require("mongoose");
const md5 = require("md5")

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const secret =process.env.SECRET


module.exports = {
  userModel: mongoose.model("User", userSchema),
};
