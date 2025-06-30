const express = require("express");
const router = express.Router();
const {
  getAllAthletes,
  finalizeGalleryImage,
  finalizeHeroImage,
  finalizeCoverImage,
} = require("../controllers/imageController");

router.get("/athletes/unselected", getAllAthletes);
router.post("/finalize/gallery", finalizeGalleryImage);
router.post("/finalize/hero", finalizeHeroImage);
router.post("/finalize/cover", finalizeCoverImage);

module.exports = router;
