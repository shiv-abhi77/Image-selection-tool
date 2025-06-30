const mongoose = require("mongoose");

const DisciplineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
  },
  { _id: false }
);

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { _id: false }
);

const FederationAffiliationSchema = new mongoose.Schema(
  {
    athlete_id_within_federation: { type: String, required: true },
    body_name: { type: String, required: true },
    body_url: { type: String, required: true },
  },
  { _id: false }
);

const SocialHandlesSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: null },
    instagram: { type: String, default: null },
    linkedIn: { type: String, default: null },
    twitter: { type: String, default: null },
  },
  { _id: false }
);

const PhysicalAttributesSchema = new mongoose.Schema(
  {
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    dominant_hand: { type: String, default: null },
  },
  { _id: false }
);

const AthleteSchema = new mongoose.Schema({
  athlete_within_federation_affiliated_ids: [{ type: String }],
  display_name: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  disciplines: [DisciplineSchema],
  teams: [TeamSchema],
  date_of_birth: { type: Date, required: true },
  date_of_birth_raw: { type: String },
  year_of_birth: { type: Number },
  nationality: { type: String },
  events_raw: [{ type: String }],
  federation_affiliations: [FederationAffiliationSchema],
  image_url: { type: String },
  gender: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  social_handles: { type: SocialHandlesSchema, default: () => ({}) },
  physical_attributes: { type: PhysicalAttributesSchema, default: () => ({}) },
  events: [{ type: String }],
  hero_image: { type: String },
});

module.exports = mongoose.model("Athlete", AthleteSchema, "athletes");
