const mongoose = require("mongoose");

const galleryImageSchema = new mongoose.Schema({
  athlete_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  athlete_name: String,
  url: { type: String, required: true },
  original_url: String,
  source: String,
  text: String,
  selected_at: { type: Date, default: Date.now },
  }, { timestamps: true },
);

module.exports = mongoose.model(
  "GalleryImage",
  galleryImageSchema,
  "gallery_images"
);
