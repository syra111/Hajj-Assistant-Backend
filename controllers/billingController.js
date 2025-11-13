import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Fixed Price IDs (from your Stripe dashboard)
// const PRICE_IDS = {
//   basic: "price_1SQ8MZDnb79Qp3s1xuensedM",   // recurring
//   premium: "price_1SQ8NaDnb79Qp3s1ggD9NJrf", // recurring
//   hajj: "price_1SQ8Q6Dnb79Qp3s1GWQS63gG",    // one-time
// };

// export const createCheckoutSession = async (req, res) => {
//   try {
//     const { plan, userId } = req.body;

//     const priceId = PRICE_IDS[plan];
//     if (!priceId) {
//       return res.status(400).json({ error: "Invalid plan" });
//     }

//     // Determine mode: subscription vs one-time payment
//     const mode = plan === "hajj" ? "payment" : "subscription";

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode,
//       line_items: [
//         {
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       success_url: `${process.env.FRONTEND_URL}/payment-success?plan=${plan}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
//       metadata: { userId, plan },
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error("Billing Error:", error);
//     res.status(500).json({ error: "Error creating checkout session" });
//   }
// };

export const createCheckoutSession = async (req, res) => {
  try {
    const { plan, userId } = req.body;
    const user = await User.findById(userId);

    const PRICE_IDS = {
      basic: "price_1SQ8MZDnb79Qp3s1xuensedM",
      premium: "price_1SQ8NaDnb79Qp3s1ggD9NJrf",
      hajj: "price_1SQ8Q6Dnb79Qp3s1GWQS63gG",
    };

    const priceId = PRICE_IDS[plan];
    if (!priceId) return res.status(400).json({ error: "Invalid plan" });

    const mode = plan === "hajj" ? "payment" : "subscription";

  
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: { userId, plan },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Billing Error:", error);
    res.status(500).json({ error: "Error creating checkout session" });
  }
};
export const manageBillingPortal = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user?.stripeCustomerId) {
      return res.status(400).json({ message: "No Stripe customer found" });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/billing`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    res.status(500).json({ message: "Failed to open billing portal" });
  }
};
