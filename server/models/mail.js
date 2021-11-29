let mongoose = require("mongoose"),
 mailSchema = mongoose.Schema({
    email: String,
    html: String
  });

module.exports = mongoose.model("Mail", mailSchema, 'mail');