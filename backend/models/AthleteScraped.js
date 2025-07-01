const mongoose = require("mongoose");

const athleteSchema = new mongoose.Schema({
  athlete_id: mongoose.Schema.Types.ObjectId,
  athlete_name: String,
  image_urls: [
    {
      url: String,
      text: String,
      source: String,
    }
  ],
  total_images_found: Number,
  discipline: String,
  created_at: Date,
  updated_at: Date,
});

module.exports = mongoose.model(
  "AthleteScraped",
  athleteSchema,
  "scraped_image_urls"
);
