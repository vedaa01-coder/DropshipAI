export const COUNTRY_CONFIG = {
  US: {
    currency: "USD",
    trendSources: ["google_trends_us"],
    supplierSources: ["aliexpress", "alibaba", "spocket"],
    paymentProvider: "stripe",
  },
  IN: {
    currency: "INR",
    trendSources: ["google_trends_in"],
    supplierSources: ["indiamart", "tradeindia", "udaan"],
    paymentProvider: "razorpay",
  },
} as const;