import dotenv from "dotenv";

dotenv.config();

export const TEST_STORE = {
  userId: "test-user",
  shopDomain: process.env.SHOPIFY_TEST_STORE_DOMAIN || "",
  accessToken: process.env.SHOPIFY_TEST_ACCESS_TOKEN || "",
  country: "US" as const,
  platform: "shopify" as const,
};