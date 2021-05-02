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
    origin_id: {
      type: Number,
      required: true
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model("Category", categorySchema);
