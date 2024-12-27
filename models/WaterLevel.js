const mongoose = require("mongoose");

// Define the schema for water level data
const waterLevelSchema = new mongoose.Schema({
  level: { type: Number, required: true },  // Water level in cm
  timestamp: { type: Date, default: Date.now },  // Timestamp of the reading
});

// Create the model for the water level data
const WaterLevel = mongoose.model("WaterLevel", waterLevelSchema);

module.exports = WaterLevel;