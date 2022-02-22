let mongoose = require("mongoose"),
 configSchema = mongoose.Schema({
    email: String,
    status: Boolean,
    dulation: Number,
    from: String,
    to: String,
    fba: Boolean,
    mba: Boolean,
    new: Boolean,
    mint: Boolean,
    verygood: Boolean,
    good: Boolean,
    acceptable: Boolean
  });

module.exports = mongoose.model("Config", configSchema, 'config');