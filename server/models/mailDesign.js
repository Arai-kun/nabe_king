let mongoose = require("mongoose"),
 mailDesignSchema = mongoose.Schema({
    email: String,
    design: String
  });

module.exports = mongoose.model("MailDesign", mailDesignSchema, 'mailDesign');