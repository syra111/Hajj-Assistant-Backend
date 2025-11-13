import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },

    password: {
        type: String,
        required: true,
        minlength: 8,
    },

    country: {
        type: String,
        required: true,
        enum: [
            "Saudi Arabia",
            "USA",
            "UK",
            "UAE",
            "Pakistan",
            "India",
            "Egypt",
            "Malaysia"
        ],
    },

    preferredLanguage: {
        type: String,
        required: true,
        enum: ["English", "Arabic", "Urdu", "French"],
    },

    heardAboutUs: {
        type: String,
        default: null, // field optional
        trim: true,
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    subscriptions: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserSubscription",
  }
]


}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
