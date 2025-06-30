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

            // Join Gallery data
            {
              $lookup: {
                from: "gallery_images",
                localField: "athlete_id",
                foreignField: "athlete_id",
                as: "gallery",
              },
            },
            // Since athlete_id is unique in gallery, we can safely unwind
            { $unwind: { path: "$gallery", preserveNullAndEmptyArrays: true } },

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

                // Gallery images
                galleryFinalized: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$gallery", null] },
                        {
                          $gt: [
                            {
                              $size: {
                                $ifNull: ["$gallery.selected_images", []],
                              },
                            },
                            0,
                          ],
                        },
                      ],
                    },
                    true,
                    false,
                  ],
                },
                galleryFinalizedAt: "$gallery.selected_at",
                galleryImages: {
                  $ifNull: ["$gallery.selected_images", []],
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
    const { athleteId, selected_images } = req.body;

    // Validation
    if (
      !athleteId ||
      !Array.isArray(selected_images) ||
      selected_images.length === 0 ||
      !selected_images.every((img) => img.url && typeof img.url === "string")
    ) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Upload all images to Cloudinary and map to objects with both URLs
    const uploadedImages = await Promise.all(
      selected_images.map(async (img) => {
        const uploadedUrl = await uploadToCloudinary(img.url, "gallery");
        return {
          url: uploadedUrl, // Cloudinary URL
          original_url: img.url, // Original image URL
          source: img.source,
          text: img.text
        };
      })
    );

    // Add to existing gallery images, don't replace
    const galleryDoc = await GalleryImage.findOne({ athlete_id: new mongoose.Types.ObjectId(athleteId) });
    let newImages = uploadedImages;
    if (galleryDoc && Array.isArray(galleryDoc.selected_images)) {
      // Avoid duplicates by original_url
      const existingOriginalUrls = new Set(galleryDoc.selected_images.map(img => img.original_url));
      newImages = [
        ...galleryDoc.selected_images,
        ...uploadedImages.filter(img => !existingOriginalUrls.has(img.original_url))
      ];
    }

    // Save/update in DB
    await GalleryImage.findOneAndUpdate(
      { athlete_id: new mongoose.Types.ObjectId(athleteId) },
      {
        athlete_id: new mongoose.Types.ObjectId(athleteId),
        selected_images: newImages,
        selected_at: new Date(),
      },
      { upsert: true, new: true }
    );

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
    const url = await uploadToCloudinary(selected_images[0].url, "hero");
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
    const url = await uploadToCloudinary(selected_images[0].url, "cover");
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

module.exports = {
  getAllAthletes,
  finalizeGalleryImage,
  finalizeHeroImage,
  finalizeCoverImage,
};
