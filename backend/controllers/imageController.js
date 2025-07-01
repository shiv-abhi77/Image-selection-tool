const mongoose = require("mongoose");
const AthleteScraped = require("../models/AthleteScraped");
const GalleryImage = require("../models/GalleryImage");
const cloudinary = require("cloudinary").v2;
const axiosHttp = require("axios");
const streamifier = require("streamifier");
const Athlete = require("../models/Athlete");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllAthletes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const result = await AthleteScraped.aggregate([
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },

            // Join Athlete data
            {
              $lookup: {
                from: "athletes",
                localField: "athlete_id",
                foreignField: "_id",
                as: "athlete",
              },
            },
            { $unwind: { path: "$athlete", preserveNullAndEmptyArrays: true } },

            // Join Gallery data (now each image is a separate document)
            {
              $lookup: {
                from: "gallery_images",
                localField: "athlete_id",
                foreignField: "athlete_id",
                as: "galleryImages",
              },
            },

            // Project required fields + finalized flags
            {
              $project: {
                athlete_id: 1,
                name: 1,
                athlete_name: 1,
                image_urls: 1,
                total_images_found: 1,
                discipline: 1,

                // Hero image
                heroImageFinalized: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$athlete.hero_image", null] },
                        { $ne: ["$athlete.hero_image", ""] },
                      ],
                    },
                    true,
                    false,
                  ],
                },
                heroImageUrl: "$athlete.hero_image",
                heroFinalizedAt: "$athlete.updated_at",

                // Cover image
                coverImageFinalized: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$athlete.image_url", null] },
                        { $ne: ["$athlete.image_url", ""] },
                      ],
                    },
                    true,
                    false,
                  ],
                },
                coverImageUrl: "$athlete.image_url",
                coverFinalizedAt: "$athlete.updated_at",

                // Gallery images (new schema: array of images)
                galleryFinalized: {
                  $cond: [
                    {
                      $gt: [{ $size: { $ifNull: ["$galleryImages", []] } }, 0],
                    },
                    true,
                    false,
                  ],
                },
                galleryFinalizedAt: {
                  $cond: [
                    {
                      $gt: [{ $size: { $ifNull: ["$galleryImages", []] } }, 0],
                    },
                    { $max: "$galleryImages.selected_at" },
                    null,
                  ],
                },
                galleryImages: {
                  $ifNull: ["$galleryImages", []],
                },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const athletes = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    res.json({
      athletes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error in getAllAthletes:", err);
    res.status(500).json({
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

async function uploadToCloudinary(imageUrl, folder = "athlete_images") {
  const response = await axiosHttp.get(imageUrl, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(response.data, "binary");
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, use_filename: true, unique_filename: true, overwrite: true },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

const finalizeGalleryImage = async (req, res) => {
  try {
    const { athleteId, selected_images, athlete_name } = req.body;

    // Validation
    if (
      !athleteId ||
      !Array.isArray(selected_images) ||
      selected_images.length === 0 ||
      !selected_images.every((img) => img.url && typeof img.url === "string")
    ) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Insert each image as a separate document, uploading to Cloudinary
    const docs = [];
    for (const img of selected_images) {
      // Upload to Cloudinary and get the secure URL
      const cloudinaryUrl = await uploadToCloudinary(img.url, "gallery_images");
      docs.push({
        athlete_id: new mongoose.Types.ObjectId(athleteId),
        athlete_name: athlete_name || undefined,
        url: cloudinaryUrl, // Use Cloudinary URL
        original_url: img.url,
        source: img.source,
        text: img.text,
        selected_at: new Date(),
      });
    }
    await GalleryImage.insertMany(docs);

    res.status(200).json({ message: "Gallery image(s) finalized" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const finalizeHeroImage = async (req, res) => {
  try {
    const { athleteId, selected_images } = req.body;
    if (
      !athleteId ||
      !Array.isArray(selected_images) ||
      selected_images.length !== 1 ||
      !selected_images[0].url ||
      typeof selected_images[0].url !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "Must select exactly one valid image for hero" });
    }
    const url = await uploadToCloudinary(selected_images[0].url, "hero_images");
    await Athlete.findByIdAndUpdate(
      athleteId,
      { hero_image: url },
      { new: true }
    );
    res.status(200).json({ message: `hero image finalized` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const finalizeCoverImage = async (req, res) => {
  try {
    const { athleteId, selected_images } = req.body;
    if (
      !athleteId ||
      !Array.isArray(selected_images) ||
      selected_images.length !== 1 ||
      !selected_images[0].url ||
      typeof selected_images[0].url !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "Must select exactly one valid image for cover" });
    }
    const url = await uploadToCloudinary(
      selected_images[0].url,
      "avatar_images"
    );
    await Athlete.findByIdAndUpdate(
      athleteId,
      { image_url: url },
      { new: true }
    );
    res.status(200).json({ message: `cover image finalized` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Regex search for athletes by name
const searchAthletes = async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q) return res.json([]);
    // Search in AthleteScraped collection by athlete_name (case-insensitive regex)
    const results = await AthleteScraped.find({
      athlete_name: { $regex: q, $options: "i" },
    }).limit(20);
    console.log(results);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller for fetching gallery images by athlete_id
const getGalleryImagesByAthlete = async (req, res) => {
  const athlete_id = req.query.athlete_id;
  if (!athlete_id) return res.json([]);
  const images = await GalleryImage.find({ athlete_id });
  res.json(images);
};

module.exports = {
  getAllAthletes,
  finalizeGalleryImage,
  finalizeHeroImage,
  finalizeCoverImage,
  searchAthletes,
  getGalleryImagesByAthlete,
};
