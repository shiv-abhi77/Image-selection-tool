require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

mongoose.connect(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

app.use("/api/images", require("./routes/images"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
