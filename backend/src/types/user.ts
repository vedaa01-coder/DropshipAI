export type OnboardingStatus =
  | "account_created"
  | "shopify_connected"
  | "profile_completed"
  | "subscription_pending"
  | "active";

export interface AppUserConfig {
  userId: string;
  email?: string;
  country: "US" | "IN";
  niche: string;
  platform: "shopify" | "amazon";
  shopDomain: string;
  accessToken: string;
  subscriptionStatus?: "inactive" | "trialing" | "active" | "past_due" | "canceled";
  onboardingStatus?: OnboardingStatus;
  isActive?: boolean;
  useAI?: boolean;
  createdAt?: string;
  updatedAt?: string;
}