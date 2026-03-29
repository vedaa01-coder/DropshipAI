import dotenv from "dotenv";
dotenv.config();

export const env = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
};