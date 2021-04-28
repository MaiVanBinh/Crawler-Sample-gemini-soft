const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    program_name: {
      type: String,
    },
    subcribe: {
      type: Number,
    },
    category_id: {
      type: Object,
      required: String,
    },
    website: {
      type: String,
    },
    web_id: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Program", categorySchema);
