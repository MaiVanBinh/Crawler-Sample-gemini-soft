const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true
    },
    web_id: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
