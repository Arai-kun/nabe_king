let mongoose = require("mongoose"),
 mailSchema = mongoose.Schema({
    email: String,
    html: String,
    subject: String,
    to: String
  });

module.exports = mongoose.model("Mail", mailSchema, 'mail');