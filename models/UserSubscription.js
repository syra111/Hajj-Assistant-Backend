import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  planName: {
    type: String,
    enum: ["free", "basic", "premium", "hajj"],
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  durationDays: {
    type: Number,
    required: true,
  },

  minutesAllowed: {
    type: Number,
  },

  unlimitedMinutes: {
    type: Boolean,
    default: false,
  },

  minutesUsed: {
    type: Number,
    default: 0,
  },

  startDate: {
    type: Date,
    default: Date.now,
  },

  endDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "expired", "cancelled"],
    default: "active",
  },
});

export default mongoose.model("UserSubscription", subscriptionSchema);
