import UserSubscription from "../models/UserSubscription.js";
import User from "../models/User.js";
import { subscriptionPlans } from "../constants/subscriptionPlans.js";
import Stripe from "stripe";

export const startSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plan } = req.body;

    if (!plan || !subscriptionPlans[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const existingSub = await UserSubscription.findOne({ userId, status: "active" });

    if (existingSub) {
      return res.status(400).json({ message: "You already have an active subscription." });
    }

    const planData = subscriptionPlans[plan];

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planData.durationDays);

    const subscription = await Subscription.create({
      user: userId,
      plan,
      minutesAllowed: planData.unlimitedMinutes ? null : planData.minutesAllowed,
      minutesUsed: 0,
      unlimitedMinutes: planData.unlimitedMinutes,
      status: "active",
      expiresAt
      
    });

    await User.findByIdAndUpdate(userId, {
      plan,
      subscriptionRenewsOn: expiresAt
    });

    res.status(201).json({
      message: `${plan} subscription started successfully.`,
      subscription
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// export const getUserSubscription = async (req, res) => {
//   try {
//     // console.log("User from token =>", req.user);
//     const userId = req.user._id;

//     const subscription = await UserSubscription.findOne({ userId })
//       .sort({ createdAt: -1 });

//     const now = new Date();

   
//     if (!subscription) {
//       return res.status(200).json({
//         subscribed: true,
//         plan: "free",
//         status: "active",
//         minutesAllowed: 15,
//         minutesUsed: 0,
//         unlimitedMinutes: false,
//         remainingMinutes: 15,
//       });
//     }

//     let status = subscription.status;

//     // Auto-expire logic
//     if (status === "active" && now > subscription.endDate) {
//       status = "expired";
//       subscription.status = "expired";
//       await subscription.save();
//     }

//     return res.status(200).json({
//       subscribed: status === "active",
//       plan: subscription.planName, // <-- added this line
//       status: status,
//       minutesAllowed: subscription.minutesAllowed,
//       minutesUsed: subscription.minutesUsed,
//       unlimitedMinutes: subscription.unlimitedMinutes,
//       remainingMinutes: subscription.unlimitedMinutes
//         ? "Unlimited"
//         : Math.max(subscription.minutesAllowed - subscription.minutesUsed, 0),
//       expiresAt: subscription.endDate,

//     });

//   } catch (error) {
//     console.error("Error fetching subscription:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const subscription = await UserSubscription.findOne({ userId }).sort({ createdAt: -1 });

    const now = new Date();

    
    if (!subscription) {
      return res.status(200).json({
        subscribed: true,
        plan: "free",
        status: "active",
        minutesAllowed: 15,
        minutesUsed: 0,
        unlimitedMinutes: false,
        remainingMinutes: 15,
        startDate: now,
        renewsOn: new Date(now.setDate(now.getDate() + 30)), 
      });
    }

   
    if (subscription.status === "active" && now > subscription.expiresAt) {
      subscription.status = "expired";
      await subscription.save();
    }

   
    const remainingMinutes = subscription.unlimitedMinutes
      ? "Unlimited"
      : Math.max(subscription.minutesAllowed - subscription.minutesUsed, 0);

    
    let renewsOn = subscription.expiresAt || subscription.endDate;
    if (!renewsOn) {
      renewsOn = new Date(subscription.startDate || now);
      renewsOn.setDate(renewsOn.getDate() + 30);
    }

    return res.status(200).json({
      subscribed: subscription.status === "active",
      plan: subscription.plan || subscription.planName || "free",
      status: subscription.status,
      minutesAllowed: subscription.minutesAllowed,
      minutesUsed: subscription.minutesUsed,
      unlimitedMinutes: subscription.unlimitedMinutes,
      remainingMinutes,
      startDate: subscription.startDate,
      renewsOn,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const createFreeSubscription = async (userId) => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 365 * 10); 

  const freeSub = new UserSubscription({
    userId,
    planName: "free",
    price: 0,
    durationDays: 3650, 
    minutesAllowed: 15,
    unlimitedMinutes: false,
    minutesUsed: 0,
    startDate: now,
    endDate,
    status: "active",
  });

  await freeSub.save();
};

export const upgradeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user._id;

    const planDetails = {
      free: { minutesAllowed: 15, unlimitedMinutes: false, durationDays: 30 },
      basic: { minutesAllowed: 200, unlimitedMinutes: false, durationDays: 30 },
      premium: { minutesAllowed: 500, unlimitedMinutes: false, durationDays: 30 },
      hajj: { minutesAllowed: 0, unlimitedMinutes: true, durationDays: 60 },
    };

    if (!planDetails[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

   
    const existing = await UserSubscription.findOne({ userId });

    if (existing && existing.plan === plan && existing.status === "active") {
      return res.status(400).json({ message: "You already have this active plan." });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + planDetails[plan].durationDays);

    const updated = await UserSubscription.findOneAndUpdate(
      { userId },
      {
        plan,
        status: "active",
        minutesAllowed: planDetails[plan].minutesAllowed,
        unlimitedMinutes: planDetails[plan].unlimitedMinutes,
        minutesUsed: 0,
        startedAt: now,
        expiresAt,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: `Your plan has been upgraded to ${plan}`,
      subscription: updated,
    });
  } catch (err) {
    console.error("Upgrade error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await UserSubscription.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Only active subscriptions can be cancelled' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
