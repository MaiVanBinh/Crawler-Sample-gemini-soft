const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    title: {
      type: String,
    },
    subcribe: {
      type: Number,
    },
    category_id: {
      type: Object,
      required: String,
    },
    description: {
      type: String,
    },
    website: {
      type: String,
    },
    origin_id: {
      type: Number,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model("Program", categorySchema);
