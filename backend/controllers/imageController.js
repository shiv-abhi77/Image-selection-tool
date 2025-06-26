const mongoose = require("mongoose");
const Athlete = require("../models/Athlete");
const ProfileImage = require("../models/ProfileImage");
const GalleryImage = require("../models/GalleryImage");

// const getAllUnselectedAthletes = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;
//     const skip = (page - 1) * limit;
//     // Fetch finalized athlete IDs from both collections
//     const profileSelected = await ProfileImage.find({}, "athlete_id");
//     const gallerySelected = await GalleryImage.find({}, "athlete_id");

//     const profileIds = new Set(
//       profileSelected.map((doc) => doc.athlete_id.toString())
//     );
//     const galleryIds = new Set(
//       gallerySelected.map((doc) => doc.athlete_id.toString())
//     );

//     // Create a Set of athletes finalized in BOTH
//     const finalizedInBoth = new Set(
//       [...profileIds].filter((id) => galleryIds.has(id))
//     );

//     // Get ALL athlete IDs
//     const allAthletes = await Athlete.find({}, "_id");

//     // Select those not in finalizedInBoth
//     const unselectedAthletes = allAthletes.filter((athlete) => {
//       const id = athlete._id.toString();
//       return !finalizedInBoth.has(id);
//     });

//     const total = unselectedAthletes.length;
//     const paginatedIds = unselectedAthletes
//       .slice(skip, skip + limit)
//       .map((a) => a._id);

//     // Now get their full data
//     const fullUnselectedAthletes = await Athlete.find({
//       _id: { $in: paginatedIds },
//     });

//     res.json({
//       athletes: fullUnselectedAthletes,
//       total,
//       page,
//       limit,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

const getAllAthletes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Get paginated athletes
    const result = await Athlete.aggregate([
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);
    const athletes = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    console.log(athletes)

    // Fetch finalized info for all paginated athletes
    const athleteIds = athletes.map((a) => a._id);
    const profileImages = await ProfileImage.find({
      athlete_id: { $in: athleteIds },
    });
    const galleryImages = await GalleryImage.find({
      athlete_id: { $in: athleteIds },
    });

    // Map for quick lookup
    const profileMap = new Map(
      profileImages.map((img) => [img.athlete_id.toString(), img])
    );
    const galleryMap = new Map(
      galleryImages.map((img) => [img.athlete_id.toString(), img])
    );

    // Attach finalized info to each athlete
    const enrichedAthletes = athletes.map((a) => {
      const id = a._id.toString();
      const profile = profileMap.get(id);
      const gallery = galleryMap.get(id);
      return {
        ...a,
        profileFinalized: !!profile,
        profileFinalizedAt: profile?.selected_at || null,
        profileImages: profile?.selected_images || [],
        galleryFinalized: !!gallery,
        galleryFinalizedAt: gallery?.selected_at || null,
        galleryImages: gallery?.selected_images || [],
      };
    });
    // console.log(enrichedAthletes)

    res.json({
      athletes: enrichedAthletes,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

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

module.exports = { getAllAthletes, finalizeImage };
