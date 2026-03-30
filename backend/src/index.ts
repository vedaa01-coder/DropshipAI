import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

import { startShopifyConnect, handleShopifyCallback } from "../src/api/connectShopify.ts";
import { getProducts } from "../src/api/getProducts.ts";
import { syncProducts } from "../src/api/syncProducts.ts";

import { getInsights } from "../src/api/getInsights.ts";
import { generateInsights } from "../src/api/generateInsights.ts";

dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());
// (no changes needed here)
app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.get("/shopify/connect", startShopifyConnect);
app.get("/shopify/callback", handleShopifyCallback);

app.get("/products", getProducts);

app.get("/sync-products", syncProducts);

app.get("/insights", getInsights);
app.get("/generate-insights", generateInsights);


app.get("/shopify", (req, res) => {
  const shop = req.query.shop as string;

  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  const redirectUri = process.env.SHOPIFY_CALLBACK_URL;
  const scopes = process.env.SHOPIFY_SCOPES;
  const clientId = process.env.SHOPIFY_API_KEY;

  console.log("SHOPIFY_CALLBACK_URL =", process.env.SHOPIFY_CALLBACK_URL);

  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri || "")}`;

  res.redirect(installUrl);
});

app.get("/shopify/callback", async (req, res) => {
  const { shop, code } = req.query as { shop?: string; code?: string };

  if (!shop || !code) {
    return res.status(400).send("Missing parameters");
  }

  try {
    const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    });

    const accessToken = response.data.access_token;
    console.log("ACCESS TOKEN:", accessToken);

    res.send("Shopify app installed successfully!");
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error during OAuth");
  }
});




const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});