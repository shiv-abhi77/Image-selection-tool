const express = require("express");
const router = express.Router();
const {
  getAllAthletes,
  finalizeGalleryImage,
  finalizeHeroImage,
  finalizeCoverImage,
  searchAthletes,
} = require("../controllers/imageController");

router.get("/athletes/unselected", getAllAthletes);
router.post("/finalize/gallery", finalizeGalleryImage);
router.post("/finalize/hero", finalizeHeroImage);
router.post("/finalize/cover", finalizeCoverImage);
router.get("/athletes/search", searchAthletes);

module.exports = router;
