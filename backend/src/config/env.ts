import dotenv from "dotenv";
dotenv.config();

export const env = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
  shopifyApiKey: process.env.SHOPIFY_API_KEY || "",
  shopifyApiSecret: process.env.SHOPIFY_API_SECRET || "",
  shopifyScopes: process.env.SHOPIFY_SCOPES || "",
  shopifyAppUrl: process.env.SHOPIFY_APP_URL || "",
  shopifyRedirectUri: process.env.SHOPIFY_REDIRECT_URI || "",

};