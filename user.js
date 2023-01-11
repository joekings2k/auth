require("dotenv").config();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const secret =process.env.API_KEY
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

module.exports = {
  userModel: mongoose.model("User", userSchema),
};
