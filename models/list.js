const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let listSchema = new Schema(
  {
    todo: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    userId: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

let list = mongoose.model("List", listSchema);
module.exports = list;
