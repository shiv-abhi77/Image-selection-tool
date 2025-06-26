const express = require("express");
const router = express.Router();
const {
  getAllAthletes,
  finalizeImage,
} = require("../controllers/imageController");

router.get("/athletes/unselected", getAllAthletes);
router.post("/finalize", finalizeImage);

module.exports = router;
