const mongoose = require("mongoose");

const galleryImageSchema = new mongoose.Schema({
  athlete_id: { type: mongoose.Schema.Types.ObjectId, unique: true },
  athlete_name: String,
  selected_images: [
    {
      url: String,
      original_url: String,
      source: String,
      text: String,
      _id: false, // Prevent Mongoose from adding _id to each image
    },
  ],
  selected_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "GalleryImage",
  galleryImageSchema,
  "gallery_images"
);
