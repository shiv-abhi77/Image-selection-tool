const mongoose = require('mongoose');

const bestImageSchema = new mongoose.Schema({
  athlete_id: mongoose.Schema.Types.ObjectId,
  athlete_name: String,
  selected_images: [{
    url: String,
    alt_text: String,
    image_id: String
  }],
  selected_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BestImage', bestImageSchema);
