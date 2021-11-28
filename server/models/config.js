let mongoose = require("mongoose"),
 configSchema = mongoose.Schema({
    email: String,
    status: Boolean,
    dulation: Number
  });

module.exports = mongoose.model("Config", configSchema, 'config');