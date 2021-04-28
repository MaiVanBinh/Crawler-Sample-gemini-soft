const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const episodeSchema = new Schema(
  {
    name: {
      type: String,
    },
    upload_date: {
      type: Date,
    },
    like: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    program_id: {
      type: Object,
      required: String,
    },
    play_count: {
      type: Number,
    },
    web_id: {
      type: String,
    },
    website: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("episode", episodeSchema);
