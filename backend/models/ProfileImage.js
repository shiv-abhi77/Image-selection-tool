const mongoose = require("mongoose");

const profileImageSchema = new mongoose.Schema({
  athlete_id: { type: mongoose.Schema.Types.ObjectId, unique: true },
  athlete_name: String,
  selected_images: [
    {
      url: String,
      alt_text: String,
      image_id: String,
    },
  ],
  selected_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "ProfileImage",
  profileImageSchema,
  "profile_images"
);
