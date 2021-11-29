let mongoose = require("mongoose"),
 userSchema = mongoose.Schema({
    email: String,
    password: String,
    seller_partner_id: String,
    refresh_token: String,
    access_token: String
  });

module.exports = mongoose.model("User", userSchema, 'user');