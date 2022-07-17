const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  token: {
    type: String,
    require: true,
  },
});

let user = mongoose.model("User", userSchema);
module.exports = user;
