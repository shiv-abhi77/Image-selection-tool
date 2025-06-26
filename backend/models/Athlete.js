const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  alt_text: String,
  image_id: String,
  index: Number,
  search_rank: Number,
  container_class: String,
  source_article: String,
  extracted_at: Date
});

const athleteSchema = new mongoose.Schema({
  athlete_id: mongoose.Schema.Types.ObjectId,
  athlete_name: String,
  image_urls: [imageSchema],
  total_images_found: Number,
  created_at: Date,
  updated_at: Date
});

module.exports = mongoose.model('Athlete', athleteSchema, "athlete_images_scraped");
