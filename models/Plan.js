import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  minutes: Number, 
  interval: { type: String, enum: ["monthly", "one-time"], default: "monthly" },
  durationDays: { type: Number, default: 30 }, 

  features: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Plan", planSchema);
