const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const episodeSchema = new Schema({
  title: {
    type: String,
  },
  like: {
    type: Number,
  },
  description: {
    type: String,
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
  origin_id: {
    type: String,
  },
  website: {
    type: String,
  },
  episode_no: {
    type: String,
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
});

module.exports = mongoose.model("episode", episodeSchema);
