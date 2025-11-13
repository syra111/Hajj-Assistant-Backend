import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/User.js"; 

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      let minutesAllowed = 0;
      let unlimited = false;

      switch (session.metadata.plan) {
        case "basic":
          minutesAllowed = 200;
          break;
        case "premium":
          minutesAllowed = 500;
          break;
        case "hajj":
          unlimited = true;
          break;
        default:
          minutesAllowed = 0;
      }

      await User.findByIdAndUpdate(session.metadata.userId, {
        subscribed: true,
        status: "active",
        plan: session.metadata.plan,
        minutesAllowed: minutesAllowed,
        minutesUsed: 0,
        unlimitedMinutes: unlimited,
        remainingMinutes: unlimited ? null : minutesAllowed,
      });
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object;
      await User.findByIdAndUpdate(subscription.metadata.userId, {
        subscribed: false,
        status: "cancelled",
        remainingMinutes: 0,
        unlimitedMinutes: false,
      });
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
