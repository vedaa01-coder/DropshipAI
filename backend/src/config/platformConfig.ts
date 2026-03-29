export const PLATFORM_CONFIG = {
  shopify: {
    supportsOrders: true,
    supportsInventory: true,
    supportsFees: false,
  },
  amazon: {
    supportsOrders: true,
    supportsInventory: true,
    supportsFees: true,
  },
} as const;