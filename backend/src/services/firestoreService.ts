import type { StandardProduct } from "../types/product.ts";
import type { DailyInsight } from "../types/insight.ts";
import type { ProductOpportunity } from "../types/opportunity.ts";
import type { AppUserConfig } from "../types/user.ts";
import { db, admin } from "../config/firebaseAdmin.ts";

export interface StoreConnection {
  userId: string;
  shopDomain: string;
  accessToken: string;
  platform: "shopify" | "amazon";
  country: "US" | "IN";
}

function userDoc(userId: string) {
  return db.collection("users").doc(userId);
}

function productsCol(userId: string) {
  return userDoc(userId).collection("products");
}

function insightsCol(userId: string) {
  return userDoc(userId).collection("insights");
}

function opportunitiesCol(userId: string) {
  return userDoc(userId).collection("opportunities");
}

export async function saveUserProfile(user: AppUserConfig): Promise<void> {
  await userDoc(user.userId).set(
    {
      ...user,
      updatedAt: new Date().toISOString(),
      createdAt: user.createdAt || new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function getUserProfile(userId: string): Promise<AppUserConfig | null> {
  const snap = await userDoc(userId).get();
  if (!snap.exists) return null;

  const data = snap.data()!;
  return {
    userId: snap.id,
    email: data.email,
    country: data.country || "US",
    niche: data.niche || "general",
    platform: data.platform || "shopify",
    shopDomain: data.shopDomain || "",
    accessToken: data.accessToken || "",
    subscriptionStatus: data.subscriptionStatus || "inactive",
    onboardingStatus: data.onboardingStatus || "account_created",
    isActive: data.isActive ?? false,
    useAI: data.useAI ?? false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getActiveUsers(): Promise<AppUserConfig[]> {
  const snap = await db.collection("users").where("isActive", "==", true).get();

  return snap.docs
    .map((doc) => {
      const data = doc.data();
      return {
        userId: doc.id,
        email: data.email,
        country: data.country || "US",
        niche: data.niche || "general",
        platform: data.platform || "shopify",
        shopDomain: data.shopDomain || "",
        accessToken: data.accessToken || "",
        subscriptionStatus: data.subscriptionStatus || "inactive",
        onboardingStatus: data.onboardingStatus || "account_created",
        isActive: data.isActive ?? false,
        useAI: data.useAI ?? false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } satisfies AppUserConfig;
    })
    .filter((u) => !!u.shopDomain && !!u.accessToken);
}

export async function saveProducts(userId: string, products: StandardProduct[]): Promise<void> {
  const batch = db.batch();

  const existing = await productsCol(userId).get();
  existing.docs.forEach((doc) => batch.delete(doc.ref));

  for (const product of products) {
    const ref = productsCol(userId).doc(product.externalProductId);
    batch.set(ref, {
      ...product,
      userId,
      updatedAt: new Date().toISOString(),
    });
  }

  await batch.commit();
}

export async function getSavedProducts(userId: string): Promise<StandardProduct[]> {
  const snap = await productsCol(userId).get();
  return snap.docs.map((doc) => doc.data() as StandardProduct);
}

export async function getProductById(
  userId: string,
  productId: string
): Promise<StandardProduct | undefined> {
  const snap = await productsCol(userId).doc(productId).get();
  if (!snap.exists) return undefined;
  return snap.data() as StandardProduct;
}

export async function saveInsights(userId: string, insights: DailyInsight[]): Promise<void> {
  const batch = db.batch();

  const existing = await insightsCol(userId).get();
  existing.docs.forEach((doc) => batch.delete(doc.ref));

  for (const insight of insights) {
    const ref = insightsCol(userId).doc(insight.id);
    batch.set(ref, {
      ...insight,
      userId,
    });
  }

  await batch.commit();
}

export async function getSavedInsights(userId: string): Promise<DailyInsight[]> {
  const snap = await insightsCol(userId).get();
  return snap.docs.map((doc) => doc.data() as DailyInsight);
}

export async function saveOpportunities(
  userId: string,
  opportunities: ProductOpportunity[]
): Promise<void> {
  const batch = db.batch();

  const existing = await opportunitiesCol(userId).get();
  existing.docs.forEach((doc) => batch.delete(doc.ref));

  for (const opportunity of opportunities) {
    const ref = opportunitiesCol(userId).doc(opportunity.id);
    batch.set(ref, {
      ...opportunity,
      userId,
    });
  }

  await batch.commit();
}

export async function getSavedOpportunities(userId: string): Promise<ProductOpportunity[]> {
  const snap = await opportunitiesCol(userId).orderBy("totalScore", "desc").get();
  return snap.docs.map((doc) => doc.data() as ProductOpportunity);
}

export async function saveStoreConnection(data: StoreConnection): Promise<void> {
  await userDoc(data.userId).set(
    {
      shopDomain: data.shopDomain,
      accessToken: data.accessToken,
      platform: data.platform,
      country: data.country,
      onboardingStatus: "shopify_connected",
      isActive: true,
      updatedAt: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}