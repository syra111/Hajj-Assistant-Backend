export const subscriptionPlans = {
  free: {
    price: 0,
    durationDays: 30,
    minutesAllowed: 15,
    unlimitedMinutes: false
  },
  basic: {
    price: 14.99,
    durationDays: 30,
    minutesAllowed: 200,
    unlimitedMinutes: false
  },
  premium: {
    price: 29.99,
    durationDays: 30,
    minutesAllowed: 500,
    unlimitedMinutes: false
  },
  hajj: {
    price: 49,
    durationDays: 60,
    minutesAllowed: null,
    unlimitedMinutes: true
  }
};
