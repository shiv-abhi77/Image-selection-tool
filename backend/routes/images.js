const express = require("express");
const router = express.Router();
const {
  getAllUnselectedAthletes,
  finalizeImage,
} = require("../controllers/imageController");

router.get("/athletes/unselected", getAllUnselectedAthletes);
router.post("/finalize", finalizeImage);

module.exports = router;
