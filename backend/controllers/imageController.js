const mongoose = require("mongoose");
const Athlete = require("../models/Athlete");
const BestImage = require("../models/BestImage");
const ProfileImage = require("../models/ProfileImage");
const GalleryImage = require("../models/GalleryImage");

const getAllUnselectedAthletes = async (req, res) => {
  try {
    // Fetch finalized athlete IDs from both collections
    const profileSelected = await ProfileImage.find({}, "athlete_id");
    const gallerySelected = await GalleryImage.find({}, "athlete_id");

    const profileIds = new Set(
      profileSelected.map((doc) => doc.athlete_id.toString())
    );
    const galleryIds = new Set(
      gallerySelected.map((doc) => doc.athlete_id.toString())
    );

    // Create a Set of athletes finalized in BOTH
    const finalizedInBoth = new Set(
      [...profileIds].filter((id) => galleryIds.has(id))
    );

    // Get ALL athlete IDs
    const allAthletes = await Athlete.find({}, "_id");

    // Select those not in finalizedInBoth
    const unselectedAthletes = allAthletes.filter((athlete) => {
      const id = athlete._id.toString();
      return !finalizedInBoth.has(id);
    });

    // Now get their full data
    const fullUnselectedAthletes = await Athlete.find({
      _id: {
        $in: unselectedAthletes.map((a) => a._id),
      },
    });

    res.json(fullUnselectedAthletes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Finalize image for profile or gallery
const finalizeImage = async (req, res) => {
  try {
    const { athleteId, selected_images, type } = req.body;

    if (
      !athleteId ||
      !Array.isArray(selected_images) ||
      selected_images.length === 0 ||
      !["profile", "gallery"].includes(type)
    ) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (type === "profile") {
      // Ensure only one profile image per athlete
      await ProfileImage.findOneAndUpdate(
        { athlete_id: new mongoose.Types.ObjectId(athleteId) },
        {
          athlete_id: new mongoose.Types.ObjectId(athleteId),
          selected_images,
        },
        { upsert: true, new: true }
      );
    } else {
      // Add new gallery record for this athlete
      await GalleryImage.create({
        athlete_id: new mongoose.Types.ObjectId(athleteId),
        selected_images,
      });
    }

    res.status(200).json({ message: `${type} image(s) finalized` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = { getAllUnselectedAthletes, finalizeImage };
