import dotenv from "dotenv";
dotenv.config();

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export const env = {
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  maxAiCallsPerRun: toNumber(process.env.MAX_AI_CALLS_PER_RUN, 3),
  useAI: toBoolean(process.env.USE_AI, false),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
  shopifyApiKey: process.env.SHOPIFY_API_KEY || "",
  shopifyApiSecret: process.env.SHOPIFY_API_SECRET || "",
  shopifyScopes: process.env.SHOPIFY_SCOPES || "",
  shopifyAppUrl: process.env.SHOPIFY_APP_URL || "",
  shopifyRedirectUri: process.env.SHOPIFY_REDIRECT_URI || "",

};